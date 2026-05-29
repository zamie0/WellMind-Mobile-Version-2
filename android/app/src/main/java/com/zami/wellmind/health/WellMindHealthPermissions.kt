package com.zami.wellmind.health

import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import kotlin.reflect.KClass

/** Feature-gated record types (from TaskerHealthConnect HealthConnectPermissions.kt). */
val featureBasedPermissions: Map<KClass<out Record>, Int> = emptyMap()

val wellMindRecordTypes: Set<KClass<out Record>> = setOf(
    StepsRecord::class,
    HeartRateRecord::class,
    RestingHeartRateRecord::class,
    SleepSessionRecord::class,
    OxygenSaturationRecord::class,
)

fun readPermissionsFor(
    clientFeatures: (Int) -> Int,
): Set<String> =
    wellMindRecordTypes
        .filter { recordType ->
            featureBasedPermissions[recordType]?.let { feature ->
                clientFeatures(feature) == HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
            } ?: true
        }
        .map { HealthPermission.getReadPermission(it) }
        .toSet()
