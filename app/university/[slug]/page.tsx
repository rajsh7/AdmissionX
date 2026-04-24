import CollegeOverviewPage from "@/app/college/[slug]/page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function UniversitySlugPage({ params }: PageProps) {
  return <CollegeOverviewPage params={params} />;
}
