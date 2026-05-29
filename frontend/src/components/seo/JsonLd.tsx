type Props = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export default function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
