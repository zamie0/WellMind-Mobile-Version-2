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
            if (grantedPermissions.containsAll(requiredReadPermissions)) {
                fetchHealthSnapshot(call)
            } else {
                call.reject("Health Connect permissions denied. Please allow Steps, Heart Rate, and Sleep for WellMind.")
            }
        }
    }

    @PluginMethod
    fun getHealthSnapshot(call: PluginCall) {
        val status = HealthConnectClient.getSdkStatus(context)
        if (status != HealthConnectClient.SDK_AVAILABLE) {
            call.reject("Health Connect unavailable on this device (status=$status).")
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
                val grantedPermissions = client.permissionController.getGrantedPermissions()
                if (grantedPermissions.containsAll(requiredReadPermissions)) {
                    fetchHealthSnapshot(call)
                } else {
                    activity.runOnUiThread {
                        pendingCall = call
                        permissionLauncher.launch(requestedReadPermissions)
                    }
                }
            } catch (e: Exception) {
                activity.runOnUiThread { call.reject("Health snapshot failed: ${e.message}") }
            }
        }
    }

    private fun fetchHealthSnapshot(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = HealthConnectClient.getOrCreate(context)
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

                val grantedPermissions = client.permissionController.getGrantedPermissions()
                val spo2 = if (grantedPermissions.contains(spo2Permission)) {
                    try {
                        val oxygenResponse = client.readRecords(
                            ReadRecordsRequest(
                                OxygenSaturationRecord::class,
                                TimeRangeFilter.between(start, end)
                            )
                        )
                        val oxygenValues = oxygenResponse.records.map { (it.percentage.value * 100).toInt() }
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
}
