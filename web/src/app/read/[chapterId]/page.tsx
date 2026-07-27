import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { newPB } from "@/lib/pb";
import type { Chapter } from "@/lib/types";
import Reader from "@/components/reader/Reader";

export const revalidate = 60;

async function getData(chapterId: string) {
  try {
    const pb = newPB();
    const chapter = await pb
      .collection("chapters")
      .getOne<Chapter>(chapterId, { expand: "manga" });
    const siblings = await pb.collection("chapters").getFullList<Chapter>({
      filter: pb.filter("manga = {:id}", { id: chapter.manga }),
      sort: "number",
      fields: "id,number,title",
    });
    return { chapter, siblings };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}): Promise<Metadata> {
  const { chapterId } = await params;
  const data = await getData(chapterId);
  if (!data) return { title: "Bulunamadı" };
  return {
    title: `${data.chapter.expand?.manga?.title || ""} — Bölüm ${data.chapter.number}`,
    robots: { index: false },
  };
}

export default async function ReadPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const data = await getData(chapterId);
  if (!data || !data.chapter.expand?.manga) notFound();

  return (
    <Reader
      chapter={data.chapter}
      manga={data.chapter.expand.manga}
      siblings={data.siblings}
    />
  );
}
