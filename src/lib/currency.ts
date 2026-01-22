// Vietnamese Dong currency formatter
export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(amount) + 'đ';
}

// Short format for large numbers (e.g., 1.5M, 500K)
export function formatVNDShort(amount: number): string {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + 'Tỷ';
    }
    if (absAmount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'Tr';
    }
    if (absAmount >= 1000) {
        return (amount / 1000).toFixed(0) + 'K';
    }
    return formatVND(amount);
}
