import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PersonsPage } from "@/pages/PersonsPage";
import { PersonDetailPage } from "@/pages/PersonDetailPage";
import { TagsPage } from "@/pages/TagsPage";
import { EntriesPage } from "@/pages/EntriesPage";
import { EntryDetailPage } from "@/pages/EntryDetailPage";
import { MediaPage } from "@/pages/MediaPage";
import { MediaDetailPage } from "@/pages/MediaDetailPage";
import { PersonEditPage } from "@/pages/PersonEditPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell title="Lide">
        <Routes>
          <Route path="/" element={<Navigate to="/persons" replace />} />
          <Route path="/persons" element={<PersonsPage />} />
          <Route path="/persons/:id" element={<PersonDetailPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="/entries/:id" element={<EntryDetailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/persons/:id/edit" element={<PersonEditPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
