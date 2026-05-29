package com.zami.wellmind

import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.zami.wellmind.health.HealthConnectRepository
import com.zami.wellmind.health.HealthSnapshotReader
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@CapacitorPlugin(name = "HealthBridge")
class HealthBridgePlugin : Plugin() {
    private var pendingCall: PluginCall? = null
    private var permissionLauncher: ActivityResultLauncher<Set<String>>? = null
    private val repository by lazy { HealthConnectRepository(context) }

    override fun load() {
        super.load()
    }

    override fun handleOnStart() {
        super.handleOnStart()
        if (permissionLauncher != null) return

        permissionLauncher =
            activity.registerForActivityResult(
                PermissionController.createRequestPermissionResultContract()
            ) {
                val call = pendingCall ?: return@registerForActivityResult
                pendingCall = null
                CoroutineScope(Dispatchers.IO).launch {
                    val granted = repository.hasPermissions(repository.readPermissions)
                    withContext(Dispatchers.Main) {
                        resolveStatus(
                            call,
                            granted,
                            if (granted) {
                                "Health Connect permissions granted."
                            } else {
                                "Some permissions were not granted. Open Health Connect settings to allow Steps, Heart rate, and Sleep."
                            },
                        )
                    }
                }
            }
    }

    @PluginMethod
    fun getHealthStatus(call: PluginCall) {
        val status = repository.sdkStatus()
        if (!repository.isAvailable()) {
            call.resolve(
                JSObject().apply {
                    put("isNative", true)
                    put("isAvailable", false)
                    put("permissionsGranted", false)
                    put("sdkStatus", status)
                    put("message", unavailableMessage(status))
                }
            )
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val granted = repository.hasPermissions(repository.readPermissions)
                withContext(Dispatchers.Main) {
                    resolveStatus(call, granted, "Health Connect is available.")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Health status check failed: ${e.message}")
                }
            }
        }
    }

    @PluginMethod
    fun requestHealthPermissions(call: PluginCall) {
        val status = repository.sdkStatus()
        when {
            repository.isAvailable() -> {
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        if (repository.hasPermissions(repository.readPermissions)) {
                            withContext(Dispatchers.Main) {
                                resolveStatus(call, true, "Health Connect permissions already granted.")
                            }
                            return@launch
                        }
                        withContext(Dispatchers.Main) {
                            val launcher = permissionLauncher
                            if (launcher == null) {
                                call.reject("Permission launcher not ready. Try again.")
                                return@withContext
                            }
                            pendingCall = call
                            launcher.launch(repository.readPermissions)
                        }
                    } catch (e: Exception) {
                        withContext(Dispatchers.Main) {
                            call.reject("Health Connect permission request failed: ${e.message}")
                        }
                    }
                }
            }
            status == HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> {
                repository.installHealthConnect()
                call.resolve(
                    JSObject().apply {
                        put("isNative", true)
                        put("isAvailable", false)
                        put("permissionsGranted", false)
                        put("sdkStatus", status)
                        put("message", "Update Health Connect from the Play Store, then try again.")
                    }
                )
            }
            else -> {
                repository.installHealthConnect()
                call.resolve(
                    JSObject().apply {
                        put("isNative", true)
                        put("isAvailable", false)
                        put("permissionsGranted", false)
                        put("sdkStatus", status)
                        put("message", "Install Health Connect from the Play Store, then try again.")
                    }
                )
            }
        }
    }

    @PluginMethod
    fun openHealthConnect(call: PluginCall) {
        activity.runOnUiThread {
            try {
                repository.openHealthConnect()
                call.resolve(
                    JSObject().apply {
                        put("opened", true)
                        put("message", "Opened Health Connect settings.")
                    }
                )
            } catch (e: Exception) {
                call.reject("Failed to open Health Connect: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun installHealthConnect(call: PluginCall) {
        activity.runOnUiThread {
            try {
                repository.installHealthConnect()
                call.resolve(
                    JSObject().apply {
                        put("opened", true)
                        put("message", "Opened Play Store for Health Connect.")
                    }
                )
            } catch (e: Exception) {
                call.reject("Failed to install Health Connect: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun getHealthSnapshot(call: PluginCall) {
        if (!repository.isAvailable()) {
            call.reject("Health Connect is not available on this device.")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (!repository.hasPermissions(repository.readPermissions)) {
                    withContext(Dispatchers.Main) {
                        call.reject("Health Connect permissions are required before syncing data.")
                    }
                    return@launch
                }
                val payload = HealthSnapshotReader.readSnapshot(repository)
                withContext(Dispatchers.Main) { call.resolve(payload) }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    call.reject("Health snapshot failed: ${e.message}")
                }
            }
        }
    }

    private fun resolveStatus(call: PluginCall, permissionsGranted: Boolean, message: String) {
        call.resolve(
            JSObject().apply {
                put("isNative", true)
                put("isAvailable", true)
                put("permissionsGranted", permissionsGranted)
                put("sdkStatus", HealthConnectClient.SDK_AVAILABLE)
                put("message", message)
            }
        )
    }

    private fun unavailableMessage(status: Int): String =
        when (status) {
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED ->
                "Update Health Connect from the Play Store."
            else -> "Install or enable Health Connect on this device."
        }
}
