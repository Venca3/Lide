import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PersonsPage } from "@/pages/PersonsPage";
import { PersonDetailPage } from "@/pages/PersonDetailPage";
import { TagsPage } from "@/pages/TagsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell title="Lide">
        <Routes>
          <Route path="/" element={<Navigate to="/persons" replace />} />
          <Route path="/persons" element={<PersonsPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/persons/:id" element={<PersonDetailPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
