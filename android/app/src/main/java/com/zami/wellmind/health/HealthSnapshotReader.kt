package com.zami.wellmind.health

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.time.LocalDate
import java.time.ZoneId

object HealthSnapshotReader {

    fun periodToDays(period: String?): Int = HealthMetricsCalculator.periodToDays(period)

    suspend fun readSnapshot(repository: HealthConnectRepository, periodDays: Int): JSObject {
        val zone = ZoneId.systemDefault()
        val today = LocalDate.now(zone)
        val (rangeStart, rangeEnd) = HealthMetricsCalculator.dayRange(periodDays)

        val stepsRecords = repository.readData(
            androidx.health.connect.client.records.StepsRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        val sleepRecords = repository.readData(
            androidx.health.connect.client.records.SleepSessionRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        val heartRecords = buildList {
            addAll(
                repository.readData(
                    androidx.health.connect.client.records.RestingHeartRateRecord::class,
                    rangeStart,
                    rangeEnd,
                ).records
            )
            addAll(
                repository.readData(
                    androidx.health.connect.client.records.HeartRateRecord::class,
                    rangeStart,
                    rangeEnd,
                ).records
            )
        }

        val oxygenRecords = repository.readData(
            androidx.health.connect.client.records.OxygenSaturationRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        if (periodDays == 1) {
            val todayMetrics = HealthMetricsCalculator.buildDayMetrics(
                today,
                stepsRecords,
                sleepRecords,
                heartRecords,
                oxygenRecords,
            )
            return HealthMetricsCalculator.snapshotFromDayMetrics(todayMetrics, periodDays)
        }

        val days = (0 until periodDays).map { offset ->
            val date = today.minusDays((periodDays - 1 - offset).toLong())
            HealthMetricsCalculator.buildDayMetrics(
                date,
                stepsRecords,
                sleepRecords,
                heartRecords,
                oxygenRecords,
            )
        }

        return HealthMetricsCalculator.aggregatePeriodMetrics(days, periodDays)
    }

    suspend fun readHistory(repository: HealthConnectRepository, historyDays: Int): JSObject {
        val zone = ZoneId.systemDefault()
        val today = LocalDate.now(zone)
        val days = historyDays.coerceIn(1, 30)
        val startDate = today.minusDays((days - 1).toLong())
        val rangeStart = startDate.atStartOfDay(zone).toInstant()
        val rangeEnd = java.time.Instant.now()

        val stepsRecords = repository.readData(
            androidx.health.connect.client.records.StepsRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        val sleepRecords = repository.readData(
            androidx.health.connect.client.records.SleepSessionRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        val heartRecords = buildList {
            addAll(
                repository.readData(
                    androidx.health.connect.client.records.RestingHeartRateRecord::class,
                    rangeStart,
                    rangeEnd,
                ).records
            )
            addAll(
                repository.readData(
                    androidx.health.connect.client.records.HeartRateRecord::class,
                    rangeStart,
                    rangeEnd,
                ).records
            )
        }

        val oxygenRecords = repository.readData(
            androidx.health.connect.client.records.OxygenSaturationRecord::class,
            rangeStart,
            rangeEnd,
        ).records

        val dayList = JSArray()
        for (offset in 0 until days) {
            val date = today.minusDays((days - 1 - offset).toLong())
            val metrics = HealthMetricsCalculator.buildDayMetrics(
                date,
                stepsRecords,
                sleepRecords,
                heartRecords,
                oxygenRecords,
            )
            dayList.put(HealthMetricsCalculator.dayMetricsToJson(metrics))
        }

        return JSObject().apply {
            put("days", dayList)
            put("historyDays", days)
        }
    }
}
