package com.zami.wellmind.health

import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import com.getcapacitor.JSObject
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

object HealthSnapshotReader {
    suspend fun readSnapshot(repository: HealthConnectRepository): JSObject {
        val end = Instant.now()
        val start = end.minus(1, ChronoUnit.DAYS)

        val stepsAggregate = repository.readAggregatedData(StepsRecord.COUNT_TOTAL, start, end)
        val steps = (stepsAggregate[StepsRecord.COUNT_TOTAL] as? Long) ?: 0L

        val sleepAggregate =
            repository.readAggregatedData(SleepSessionRecord.SLEEP_DURATION_TOTAL, start, end)
        val sleepDuration = sleepAggregate[SleepSessionRecord.SLEEP_DURATION_TOTAL] as? Duration
        val sleepHours = (sleepDuration?.seconds ?: 0L) / 3600.0

        var restingHr = 0
        runCatching {
            val restingAggregate =
                repository.readAggregatedData(RestingHeartRateRecord.BPM_AVG, start, end)
            restingHr = (restingAggregate[RestingHeartRateRecord.BPM_AVG] as? Double)?.toInt() ?: 0
        }

        if (restingHr == 0) {
            runCatching {
                val hrResponse = repository.readData(
                    androidx.health.connect.client.records.HeartRateRecord::class,
                    start,
                    end,
                )
                val samples = hrResponse.records.flatMap { record ->
                    (record as androidx.health.connect.client.records.HeartRateRecord).samples
                }
                if (samples.isNotEmpty()) {
                    restingHr = samples.map { it.beatsPerMinute }.average().toInt()
                }
            }
        }

        var spo2 = 0
        runCatching {
            val oxygenResponse = repository.readData(OxygenSaturationRecord::class, start, end)
            val values = oxygenResponse.records.map { record ->
                (record as OxygenSaturationRecord).percentage.value
            }
            if (values.isNotEmpty()) {
                spo2 = values.average().toInt()
            }
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

        return JSObject().apply {
            put("steps", steps)
            put("sleepScore", sleepScore)
            put("restingHr", restingHr)
            put("stressLevel", stressLevel)
            put("spo2", spo2)
            put("recovery", recovery)
            put("sleepHours", sleepHours)
        }
    }
}
