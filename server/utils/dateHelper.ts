// Helper chuyển đổi ngày sang số timestamp theo giờ Việt Nam (UTC+7)
export function toTimestamp(date: Date | string | null | undefined): number | null {
    if (!date) return null;
    
    const inputDate = new Date(date);
    
    // Kiểm tra ngày hợp lệ
    if (isNaN(inputDate.getTime())) {
        return null;
    }
    
    // Chuyển sang múi giờ Việt Nam bằng cách sử dụng toLocaleString
    const vietnamTimeStr = inputDate.toLocaleString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Chuyển về timestamp
    return new Date(vietnamTimeStr).getTime();
}