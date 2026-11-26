export default function TodayCount({ count }) {
  return (
    <p className="today-count">
      Today: <strong>{count}</strong> focus session{count === 1 ? "" : "s"}
    </p>
  );
}
