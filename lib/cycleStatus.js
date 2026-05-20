export function getCycleStatus(client) {
  const lastSeq = client.sequences?.[0];
  if (!lastSeq || !lastSeq.poses || lastSeq.poses === "null" || lastSeq.poses === "{}") {
    return { status: "none", cycleNumber: 0 };
  }
  try {
    const parsed = JSON.parse(lastSeq.poses);
    if (!parsed || !parsed.phases || parsed.phases.length === 0) {
      return { status: "none", cycleNumber: 0 };
    }
  } catch { return { status: "none", cycleNumber: 0 }; }

  const startDate = new Date(lastSeq.createdAt);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 10);
  const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  const cycleNumber = lastSeq.cycleNumber || 1;
  return daysLeft > 0
    ? { status: "active", daysLeft, cycleNumber, startDate, endDate }
    : { status: "ended", daysLeft: 0, cycleNumber, startDate, endDate };
}
