import type {
    ContradictionSignals,
    ProtectiveFactors,
    RiskAssessment,
    RiskDimensions,
    SafetyFlags,
    SemanticDetectionResult,
    TrendSnapshot,
} from './types';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const dominantRisk = (dimensions: RiskDimensions): keyof RiskDimensions => {
    return (Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'anxiety_risk') as keyof RiskDimensions;
};

export const computeRiskAssessment = (
    semantic: SemanticDetectionResult,
    protective: ProtectiveFactors,
    contradiction: ContradictionSignals,
    safetyFlags: SafetyFlags,
    trend: TrendSnapshot
): RiskAssessment => {
    const reasons: string[] = [];

    let suicide_risk =
        semantic.self_harm_intent * 70 +
        semantic.hopelessness_level * 25 +
        (semantic.intent === 'crisis' ? 20 : 0) +
        (semantic.intent === 'self_harm_risk' ? 15 : 0);

    let anxiety_risk =
        semantic.stress_level * 35 +
        (semantic.intent === 'anxiety' ? 30 : 0) +
        (semantic.emotion === 'anxiety' ? 20 : 0) +
        semantic.context_escalation * 15;

    let burnout_risk =
        (semantic.intent === 'academic_stress' ? 35 : 0) +
        semantic.stress_level * 30 +
        trend.rolling_emotional_average * 0.25 +
        trend.emotional_deterioration_score * 0.25;

    let loneliness_risk =
        (semantic.intent === 'depression_risk' ? 20 : 0) +
        semantic.hopelessness_level * 30 +
        (semantic.emotion === 'sadness' || semantic.emotion === 'hopelessness' ? 25 : 0) +
        trend.repeated_distress_detection * 0.2;

    let academic_stress_risk =
        (semantic.intent === 'academic_stress' ? 45 : 0) +
        semantic.stress_level * 30 +
        semantic.context_escalation * 15;

    if (protective.protective_factor_score > 0) {
        const reduction = protective.protective_factor_score * 22;
        suicide_risk -= reduction * 0.35;
        anxiety_risk -= reduction * 0.6;
        burnout_risk -= reduction * 0.8;
        loneliness_risk -= reduction * 0.75;
        academic_stress_risk -= reduction * 0.7;
        reasons.push(...protective.reasons);
    }

    const contradictionReduction = Math.min(
        12,
        contradiction.figurative_language_score * 8 + contradiction.humor_context_detection * 6
    );
    if (contradictionReduction > 0) {
        if (safetyFlags.direct_self_harm_detected) {
            suicide_risk -= Math.min(5, contradictionReduction * 0.4);
            reasons.push('risk reduction limited for safety despite humor or slang context');
        } else {
            suicide_risk -= contradictionReduction;
        }
        reasons.push(...contradiction.reasons);
    }

    if (trend.trend_escalation === 'high') {
        anxiety_risk += 10;
        burnout_risk += 12;
        loneliness_risk += 10;
        reasons.push('risk increased due to high trend escalation');
    } else if (trend.trend_escalation === 'medium') {
        anxiety_risk += 5;
        burnout_risk += 6;
        reasons.push('risk slightly increased due to medium trend escalation');
    }

    if (safetyFlags.direct_self_harm_detected) {
        const directSelfHarmFloor = 70;
        suicide_risk = Math.max(suicide_risk, directSelfHarmFloor);
        reasons.push('safety floor applied for direct self-harm content');
    }

    if (safetyFlags.harm_to_others_detected && !safetyFlags.direct_self_harm_detected) {
        anxiety_risk = Math.max(anxiety_risk, 55);
        reasons.push('elevated concern for harm-to-others language (not suicide crisis tier)');
    }

    if (safetyFlags.hopelessness_detected) {
        loneliness_risk = Math.max(loneliness_risk, 45);
    }

    if (safetyFlags.escalating_distress_detected) {
        anxiety_risk = Math.max(anxiety_risk, 40);
    }

    const dimensions: RiskDimensions = {
        suicide_risk: clamp(Math.round(suicide_risk)),
        anxiety_risk: clamp(Math.round(anxiety_risk)),
        burnout_risk: clamp(Math.round(burnout_risk)),
        loneliness_risk: clamp(Math.round(loneliness_risk)),
        academic_stress_risk: clamp(Math.round(academic_stress_risk)),
    };

    const dominant_risk_type = dominantRisk(dimensions);
    let overall_risk = clamp(
        Math.round(
            dimensions.suicide_risk * 0.35 +
            dimensions.anxiety_risk * 0.2 +
            dimensions.burnout_risk * 0.15 +
            dimensions.loneliness_risk * 0.15 +
            dimensions.academic_stress_risk * 0.15
        )
    );

    if (safetyFlags.direct_self_harm_detected) {
        overall_risk = Math.max(overall_risk, 70);
        reasons.push('overall risk floor applied due to direct self-harm');
    } else if (safetyFlags.harm_to_others_detected) {
        overall_risk = Math.max(overall_risk, 55);
        reasons.push('overall risk floor applied due to harm-to-others language');
    }

    reasons.push(`dominant risk type: ${dominant_risk_type}`);

    return {
        dimensions,
        overall_risk,
        dominant_risk_type,
        reasons,
    };
};
