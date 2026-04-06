export const computeBmi = (heightCm, weightKg) => {
    const h = Number(heightCm);
    const w = Number(weightKg);

    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;

    const hm = h / 100;
    return Number((w / (hm * hm)).toFixed(2));
};

export const bmiCategory = (bmi) => {
    const x = Number(bmi);
    if (!Number.isFinite(x)) return null;

    if (x < 18.5) return 'Underweight';
    if (x < 25) return 'Normal weight';
    if (x < 30) return 'Overweight';

    // Obesity classes
    if (x < 35) return 'Obesity Class I';
    if (x < 40) return 'Obesity Class II';
    return 'Obesity Class III';
};
