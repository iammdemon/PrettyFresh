export const toBanglaNumber = (num: number | string): string => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
};

export const toBanglaPrice = (price: number): string => {
    return `৳${toBanglaNumber(price.toFixed(2))}`;
};
