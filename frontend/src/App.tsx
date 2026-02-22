import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PersonDetailPage } from "@/pages/PersonDetailPage";
import { TagsPage } from "@/pages/TagsPage";
import { EntriesPage } from "@/pages/EntriesPage";
import { EntryDetailPage } from "@/pages/EntryDetailPage";
import { MediaPage } from "@/pages/MediaPage";
import { MediaDetailPage } from "@/pages/MediaDetailPage";
import { TestPage } from "@/pages/TestPage";
import { TestDetailPage } from "./pages/TestDetailPage";
import { ROUTES } from "@/lib/constants";
import { PersonsPage } from "./pages/PersonsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell title="Lide">
        <Routes>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.PERSONS} replace />} />
          <Route path={ROUTES.PERSONS} element={<PersonsPage />} />
          <Route path={ROUTES.PERSON_DETAIL} element={<PersonDetailPage />} />
          <Route path={ROUTES.TAGS} element={<TagsPage />} />
          <Route path={ROUTES.ENTRIES} element={<EntriesPage />} />
          <Route path={ROUTES.ENTRY_DETAIL} element={<EntryDetailPage />} />
          <Route path={ROUTES.MEDIA} element={<MediaPage />} />
          <Route path={ROUTES.MEDIA_DETAIL} element={<MediaDetailPage />} />
          <Route path={ROUTES.TEST} element={<TestPage />} />
          <Route path={ROUTES.TEST_DETAIL} element={<TestDetailPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
