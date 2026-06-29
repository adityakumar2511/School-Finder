import HomeBrowseClient from "@/components/public/home/HomeBrowseClient";
import {
  fetchAllCitiesFromSchools,
  fetchAllStates,
  fetchHomeBrowseSchools,
} from "@/lib/data/schools-public";

export default async function HomeBrowse() {
  const [schools, states, cities] = await Promise.all([
    fetchHomeBrowseSchools(1000),
    fetchAllStates(),
    fetchAllCitiesFromSchools(),
  ]);

  return <HomeBrowseClient schools={schools} states={states} cities={cities} />;
}