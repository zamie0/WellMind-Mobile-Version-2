package com.zami.wellmind.health

import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.net.toUri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.aggregate.AggregateMetric
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.response.ReadRecordsResponse
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
import kotlin.reflect.KClass

/**
 * Health Connect access layer ported from TaskerHealthConnect (RafhaanShah/TaskerHealthConnect).
 */
class HealthConnectRepository(
    private val context: Context,
    private val clientProvider: (Context) -> HealthConnectClient = { HealthConnectClient.getOrCreate(it) },
) {
    private val tag = "HealthConnectRepository"
    private val providerPackageName = "com.google.android.apps.healthdata"
    private val client: HealthConnectClient by lazy { clientProvider(context) }

    val readPermissions: Set<String> by lazy {
        readPermissionsFor { feature -> client.features.getFeatureStatus(feature) }
    }

    fun isAvailable(): Boolean =
        HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE

    fun sdkStatus(): Int = HealthConnectClient.getSdkStatus(context)

    fun installHealthConnect() {
        Log.d(tag, "installHealthConnect")
        val uriString =
            "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
        runCatching {
            context.startActivity(
                Intent(Intent.ACTION_VIEW).apply {
                    setPackage("com.android.vending")
                    data = uriString.toUri()
                    putExtra("overlay", true)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            )
        }.onFailure {
            Log.e(tag, "installHealthConnect failed", it)
        }
    }

    fun openHealthConnect() {
        Log.d(tag, "openHealthConnect")
        val action =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                "android.health.connect.action.HEALTH_HOME_SETTINGS"
            } else {
                "androidx.health.ACTION_HEALTH_CONNECT_SETTINGS"
            }
        runCatching {
            context.startActivity(
                Intent(action).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
            )
        }.onFailure {
            Log.e(tag, "openHealthConnect failed", it)
        }
    }

    suspend fun hasPermissions(permissions: Set<String>): Boolean {
        val granted =
            runCatching { client.permissionController.getGrantedPermissions() }.getOrElse {
                Log.e(tag, "hasPermissions failed", it)
                return false
            }
        val missing = permissions.filterNot { it in granted }
        if (missing.isNotEmpty()) {
            Log.i(tag, "hasPermissions missing: $missing")
        }
        return granted.containsAll(permissions)
    }

    suspend fun readAggregatedData(
        aggregateMetric: AggregateMetric<*>,
        startTime: Instant,
        endTime: Instant,
    ): AggregationResult {
        Log.d(tag, "readAggregatedData: ${aggregateMetric.javaClass.simpleName} $startTime $endTime")
        return client.aggregate(
            AggregateRequest(
                metrics = setOf(aggregateMetric),
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime),
            )
        )
    }

    suspend fun readData(
        recordClass: KClass<out Record>,
        startTime: Instant,
        endTime: Instant,
    ): ReadRecordsResponse<out Record> {
        Log.d(tag, "readData: $recordClass, $startTime, $endTime")
        return client.readRecords(
            ReadRecordsRequest(
                recordType = recordClass,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime),
            )
        )
    }
}
