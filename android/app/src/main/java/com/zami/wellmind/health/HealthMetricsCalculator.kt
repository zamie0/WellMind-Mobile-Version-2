package com.zami.wellmind.health

import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit

data class DayMetrics(
    val date: LocalDate,
    val steps: Long = 0,
    val sleepHours: Double = 0.0,
    val heartRate: Int = 0,
    val spo2: Int = 0,
) {
    val sleepScore: Int
        get() = when {
            sleepHours >= 8.0 -> 92
            sleepHours >= 7.0 -> 84
            sleepHours >= 6.0 -> 74
            sleepHours >= 5.0 -> 62
            sleepHours > 0.0 -> 50
            else -> 0
        }
}

object HealthMetricsCalculator {

    private val zone: ZoneId get() = ZoneId.systemDefault()

    fun periodToDays(period: String?): Int =
        when (period?.lowercase()) {
            "week" -> 7
            "month" -> 30
            else -> 1
        }

    fun dayRange(periodDays: Int): Pair<Instant, Instant> {
        val today = LocalDate.now(zone)
        val startDate = today.minusDays((periodDays - 1).toLong())
        val start = startDate.atStartOfDay(zone).toInstant()
        val end = Instant.now()
        return start to end
    }

    fun calendarDayRange(date: LocalDate): Pair<Instant, Instant> {
        val start = date.atStartOfDay(zone).toInstant()
        val end = date.plusDays(1).atStartOfDay(zone).toInstant()
        return start to end
    }

    fun stepsForDay(records: List<Record>, date: LocalDate): Long =
        records.filterIsInstance<StepsRecord>()
            .filter { recordOnDate(it.startTime, date) }
            .sumOf { it.count }

    fun sleepHoursForDay(records: List<Record>, date: LocalDate): Double {
        val (dayStart, dayEnd) = calendarDayRange(date)
        return records.filterIsInstance<SleepSessionRecord>()
            .sumOf { session ->
                val overlapStart = maxOf(session.startTime, dayStart)
                val overlapEnd = minOf(session.endTime, dayEnd)
                if (overlapEnd.isAfter(overlapStart)) {
                    ChronoUnit.MINUTES.between(overlapStart, overlapEnd).coerceAtLeast(0)
                } else {
                    0
                }
            } / 60.0
    }

    fun heartRateForDay(records: List<Record>, date: LocalDate): Int {
        val resting = records.filterIsInstance<RestingHeartRateRecord>()
            .filter { recordOnDate(it.time, date) }
            .map { it.beatsPerMinute }
        if (resting.isNotEmpty()) {
            return resting.average().toInt()
        }

        val samples = records.filterIsInstance<HeartRateRecord>()
            .filter { recordOnDate(it.startTime, date) }
            .flatMap { it.samples }
            .map { it.beatsPerMinute }
        return if (samples.isNotEmpty()) samples.average().toInt() else 0
    }

    fun spo2ForDay(records: List<Record>, date: LocalDate): Int {
        val values = records.filterIsInstance<OxygenSaturationRecord>()
            .filter { recordOnDate(it.time, date) }
            .map { it.percentage.value }
        return if (values.isNotEmpty()) values.average().toInt() else 0
    }

    fun buildDayMetrics(
        date: LocalDate,
        stepsRecords: List<Record>,
        sleepRecords: List<Record>,
        heartRecords: List<Record>,
        oxygenRecords: List<Record>,
    ): DayMetrics =
        DayMetrics(
            date = date,
            steps = stepsForDay(stepsRecords, date),
            sleepHours = sleepHoursForDay(sleepRecords, date),
            heartRate = heartRateForDay(heartRecords, date),
            spo2 = spo2ForDay(oxygenRecords, date),
        )

    fun dayMetricsToJson(metrics: DayMetrics): JSObject =
        JSObject().apply {
            put("date", metrics.date.toString())
            put("steps", metrics.steps)
            put("sleepHours", metrics.sleepHours)
            put("sleepScore", metrics.sleepScore)
            put("heartRate", metrics.heartRate)
            put("spo2", metrics.spo2)
        }

    fun snapshotFromDayMetrics(metrics: DayMetrics, periodDays: Int): JSObject {
        val restingHr = metrics.heartRate
        val sleepHours = metrics.sleepHours
        val sleepScore = metrics.sleepScore

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
            put("steps", metrics.steps)
            put("sleepScore", sleepScore)
            put("restingHr", restingHr)
            put("stressLevel", stressLevel)
            put("spo2", metrics.spo2)
            put("recovery", recovery)
            put("sleepHours", sleepHours)
            put("periodDays", periodDays)
            put("period", when (periodDays) {
                7 -> "week"
                30 -> "month"
                else -> "day"
            })
            put("date", metrics.date.toString())
        }
    }

    fun aggregatePeriodMetrics(days: List<DayMetrics>, periodDays: Int): JSObject {
        val totalSteps = days.sumOf { it.steps }
        val totalSleepHours = days.sumOf { it.sleepHours }
        val avgSleepHours = if (days.isNotEmpty()) totalSleepHours / days.size else 0.0
        val hrValues = days.map { it.heartRate }.filter { it > 0 }
        val spo2Values = days.map { it.spo2 }.filter { it > 0 }
        val avgHr = if (hrValues.isNotEmpty()) hrValues.average().toInt() else 0
        val avgSpo2 = if (spo2Values.isNotEmpty()) spo2Values.average().toInt() else 0

        val avgSleepScore = when {
            avgSleepHours >= 8.0 -> 92
            avgSleepHours >= 7.0 -> 84
            avgSleepHours >= 6.0 -> 74
            avgSleepHours >= 5.0 -> 62
            avgSleepHours > 0.0 -> 50
            else -> 0
        }

        val stressLevel = when {
            avgHr == 0 -> "Unknown"
            avgHr >= 82 -> "High"
            avgHr >= 68 -> "Medium"
            else -> "Low"
        }

        val recovery = when {
            avgHr == 0 && avgSleepScore == 0 -> 0
            else -> (avgSleepScore * 0.6 + (100 - avgHr.coerceIn(45, 100)) * 0.4).toInt().coerceIn(0, 100)
        }

        return JSObject().apply {
            put("steps", totalSteps)
            put("sleepScore", avgSleepScore)
            put("restingHr", avgHr)
            put("stressLevel", stressLevel)
            put("spo2", avgSpo2)
            put("recovery", recovery)
            put("sleepHours", avgSleepHours)
            put("periodDays", periodDays)
            put("period", when (periodDays) {
                7 -> "week"
                30 -> "month"
                else -> "day"
            })
        }
    }

    private fun recordOnDate(instant: Instant, date: LocalDate): Boolean =
        instant.atZone(zone).toLocalDate() == date
}
