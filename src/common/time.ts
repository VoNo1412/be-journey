function convertToVietnamTime(utcDate: any): string {
    const date = new Date(utcDate); // Convert to Date object

    // Convert to Vietnam Time (UTC+7)
    const vietnamOffset = 7 * 60; // 7 hours in minutes
    const localTime = new Date(date.getTime() + vietnamOffset * 60 * 1000);

    // Format as HH:mm
    return localTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
export default convertToVietnamTime;