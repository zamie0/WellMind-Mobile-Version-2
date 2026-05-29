package com.zami.wellmind

import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlinx.coroutines.CoroutineScope
import android.content.Intent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "HealthBridge")
class HealthBridgePlugin : Plugin() {
    private var pendingCall: PluginCall? = null
    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>

    private val spo2Permission = HealthPermission.getReadPermission(OxygenSaturationRecord::class)

    private val requiredReadPermissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class)
    )

    private val requestedReadPermissions = requiredReadPermissions + spo2Permission

    override fun load() {
        super.load()
        permissionLauncher = activity.registerForActivityResult(
            PermissionController.createRequestPermissionResultContract()
        ) { grantedPermissions ->
            val call = pendingCall ?: return@registerForActivityResult
            pendingCall = null
            resolveStatus(call, grantedPermissions.containsAll(requiredReadPermissions), "Health Connect permission flow completed.")
        }
    }

    @PluginMethod
    fun getHealthStatus(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            val payload = JSObject().apply {
                put("isNative", true)
                put("isAvailable", false)
                put("permissionsGranted", false)
                put("sdkStatus", status)
                put("message", "Health Connect is not available on this device.")
            }
            call.resolve(payload)
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val grantedPermissions = client.permissionController.getGrantedPermissions()
                activity.runOnUiThread {
                    resolveStatus(
                        call,
                        grantedPermissions.containsAll(requiredReadPermissions),
                        "Health Connect is available."
                    )
                }
            } catch (e: Exception) {
                activity.runOnUiThread { call.reject("Health status check failed: ${e.message}") }
            }
        }
    }

    @PluginMethod
    fun requestHealthPermissions(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            val payload = JSObject().apply {
                put("isNative", true)
                put("isAvailable", false)
                put("permissionsGranted", false)
                put("sdkStatus", status)
                put("message", "Install or enable Health Connect to continue.")
            }
            call.resolve(payload)
            return
        }

        pendingCall = call
        permissionLauncher.launch(requestedReadPermissions)
    }

    @PluginMethod
    fun openHealthConnect(call: PluginCall) {
        try {
            val action =
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
                    "android.health.connect.action.HEALTH_HOME_SETTINGS"
                else "androidx.health.ACTION_HEALTH_CONNECT_SETTINGS"

            activity.runOnUiThread {
                try {
                    activity.startActivity(Intent(action))
                    val payload = com.getcapacitor.JSObject().apply {
                        put("opened", true)
                        put("message", "Opened Health Connect settings.")
                    }
                    call.resolve(payload)
                } catch (e: Exception) {
                    call.reject("Failed to open Health Connect: ${e.message}")
                }
            }
        } catch (e: Exception) {
            call.reject("Failed to open Health Connect: ${e.message}")
        }
    }

    @PluginMethod
    fun installHealthConnect(call: PluginCall) {
        try {
            val providerPackageName = "com.google.android.apps.healthdata"
            val uriString = "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
            activity.runOnUiThread {
                try {
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setPackage("com.android.vending")
                        data = android.net.Uri.parse(uriString)
                        putExtra("overlay", true)
                    }
                    activity.startActivity(intent)
                    val payload = com.getcapacitor.JSObject().apply {
                        put("opened", true)
                        put("message", "Opened Play Store for Health Connect.")
                    }
                    call.resolve(payload)
                } catch (e: Exception) {
                    call.reject("Failed to open Play Store: ${e.message}")
                }
            }
        } catch (e: Exception) {
            call.reject("Failed to install Health Connect: ${e.message}")
        }
    }

    @PluginMethod
    fun getHealthSnapshot(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val grantedPermissions = client.permissionController.getGrantedPermissions()
                if (!grantedPermissions.containsAll(requiredReadPermissions)) {
                    activity.runOnUiThread {
                        call.reject("Health Connect permissions are required before syncing data.")
                    }
                    return@launch
                }

                val end = Instant.now()
                val start = end.minus(1, ChronoUnit.DAYS)

                val stepsResponse = client.readRecords(
                    ReadRecordsRequest(
                        StepsRecord::class,
                        TimeRangeFilter.between(start, end)
                    )
                )
                val steps = stepsResponse.records.sumOf { it.count }

                val hrResponse = client.readRecords(
                    ReadRecordsRequest(
                        HeartRateRecord::class,
                        TimeRangeFilter.between(start, end)
                    )
                )
                val hrSamples = hrResponse.records.flatMap { it.samples }
                val restingHr = if (hrSamples.isNotEmpty()) {
                    hrSamples.map { it.beatsPerMinute }.average().toInt()
                } else {
                    0
                }

                val sleepHours = try {
                    val sleepResponse = client.readRecords(
                        ReadRecordsRequest(
                            SleepSessionRecord::class,
                            TimeRangeFilter.between(start, end)
                        )
                    )
                    sleepResponse.records.sumOf { record ->
                        ChronoUnit.MINUTES.between(record.startTime, record.endTime).coerceAtLeast(0)
                    } / 60.0
                } catch (_: SecurityException) {
                    0.0
                }

                val spo2 = if (grantedPermissions.contains(spo2Permission)) {
                    try {
                        val oxygenResponse = client.readRecords(
                            ReadRecordsRequest(
                                OxygenSaturationRecord::class,
                                TimeRangeFilter.between(start, end)
                            )
                        )
                        val oxygenValues = oxygenResponse.records.map { it.percentage.value.toInt() }
                        if (oxygenValues.isNotEmpty()) oxygenValues.average().toInt() else 0
                    } catch (_: SecurityException) {
                        0
                    }
                } else {
                    0
                }

                val sleepScore = when {
                    sleepHours >= 8.0 -> 92
                    sleepHours >= 7.0 -> 84
                    sleepHours >= 6.0 -> 74
                    sleepHours >= 5.0 -> 62
                    sleepHours > 0.0 -> 50
                    else -> 0
                }

                val stressLevel = when {
                    restingHr == 0 -> "Unknown"
                    restingHr >= 82 -> "High"
                    restingHr >= 68 -> "Medium"
                    else -> "Low"
                }

                val recovery = when {
                    restingHr == 0 && sleepScore == 0 -> 0
                    else -> (sleepScore * 0.6 + (100 - restingHr.coerceIn(45, 100)) * 0.4).toInt().coerceIn(0, 100)
                }

                val payload = JSObject().apply {
                    put("steps", steps)
                    put("sleepScore", sleepScore)
                    put("restingHr", restingHr)
                    put("stressLevel", stressLevel)
                    put("spo2", spo2)
                    put("recovery", recovery)
                    put("sleepHours", sleepHours)
                }

                activity.runOnUiThread { call.resolve(payload) }
            } catch (e: Exception) {
                activity.runOnUiThread { call.reject("Health snapshot failed: ${e.message}") }
            }
        }
    }

    private fun resolveStatus(call: PluginCall, permissionsGranted: Boolean, message: String) {
        val payload = JSObject().apply {
            put("isNative", true)
            put("isAvailable", true)
            put("permissionsGranted", permissionsGranted)
            put("sdkStatus", HealthConnectClient.SDK_AVAILABLE)
            put("message", message)
        }
        call.resolve(payload)
    }
}
