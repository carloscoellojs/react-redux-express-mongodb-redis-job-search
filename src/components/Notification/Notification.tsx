export const Notification = ({ message }: { message: string }) => (
  <div
    className="notification-info bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-auto my-4"
    role="alert"
  >
    <p className="mt-1">{message}</p>
  </div>
);
