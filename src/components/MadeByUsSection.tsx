import Image from "next/image";

export default function MadeByUsSection({ images }: { images: { id: string; url: string }[] }) {
  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 text-center font-jost">
      <h2 className="text-[31px] font-medium text-black mb-8">Made By Us, Styled By You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-[2/3] overflow-hidden bg-brand-light transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
