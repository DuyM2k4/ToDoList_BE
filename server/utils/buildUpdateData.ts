export function buildUpdateData(body: any) {
    const { title, description, isCompleted, dueDate } = body;
    const updateData: Record<string, any> = {};
    const currentTimestamp = Date.now();

    if (title !== undefined && title !== null) updateData.title = title;
    if (description !== undefined && description !== null) updateData.description = description;

    if (isCompleted !== undefined && isCompleted !== null) {
        updateData.isCompleted = isCompleted === 'true' || isCompleted === true;
    }

    if (dueDate !== undefined && dueDate !== null) {
        updateData.dueDate = dueDate === "" ? null : dueDate;
    }

    updateData.updatedAt = currentTimestamp;
    return updateData;
}
