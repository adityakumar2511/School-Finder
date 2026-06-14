import SchoolCardSkeleton from "./SchoolCardSkeleton";

type Props = {
  count?: number;
};

export default function SchoolGridSkeleton({ count = 6 }: Props) {
  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-pulse"
      aria-busy
      aria-label="Loading schools"
    >
      {Array.from({ length: count }).map((_, index) => (
        <SchoolCardSkeleton key={index} />
      ))}
    </div>
  );
}
