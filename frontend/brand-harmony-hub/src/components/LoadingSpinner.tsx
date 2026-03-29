const LoadingSpinner = ({ size = 40 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full animate-spin-gradient"
      style={{
        width: size,
        height: size,
        border: '3px solid hsl(var(--muted))',
        borderTopColor: 'hsl(var(--primary))',
        borderRightColor: 'hsl(var(--secondary))',
      }}
    />
  </div>
);

export default LoadingSpinner;
