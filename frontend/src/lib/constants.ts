// Frontend constants for entities, API endpoints, and common values

// Entity names (singular/plural)
export const ENTITIES = {
  PERSON: { singular: "Person", plural: "People" },
  ENTRY: { singular: "Entry", plural: "Entries" },
  TAG: { singular: "Tag", plural: "Tags" },
  MEDIA: { singular: "Media", plural: "Media" },
  ITEM: { singular: "Item", plural: "Items" },
} as const;

// API base paths
export const API_BASE = "/api";

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE}/health`,

  // CRUD endpoints
  PERSONS: `${API_BASE}/persons`,
  ENTRIES: `${API_BASE}/entries`,
  TAGS: `${API_BASE}/tags`,
  MEDIA: `${API_BASE}/media`,

  // Read aggregation
  PERSON_READ: `${API_BASE}/personread`,
  ENTRY_READ: `${API_BASE}/entryread`,

  // Relationship endpoints
  PERSON_TAGS: `${API_BASE}/personstags`,
  ENTRY_TAGS: `${API_BASE}/entriestags`,
  PERSON_ENTRIES: `${API_BASE}/personentry`,
  MEDIA_ENTRIES: `${API_BASE}/mediaentry`,
  PERSON_RELATIONS: `${API_BASE}/personrelation`,
} as const;

// Common query keys for React Query
export const QUERY_KEYS = {
  PERSON: (id?: string) => id ? ["person", id] : ["person"],
  PERSON_READ: (id: string) => ["personread", id],
  ENTRY: (id?: string) => id ? ["entry", id] : ["entry"],
  ENTRY_READ: (id: string) => ["entryread", id],
  TAG: (id?: string) => id ? ["tag", id] : ["tag"],
  MEDIA: (id?: string) => id ? ["media", id] : ["media"],

  // Relationships
  PERSON_TAGS: (personId: string) => ["persontags", "tags-for-person", personId],
  TAGS_FOR_PERSON: (personId: string) => ["persontags", "tags-for-person", personId],
  PERSONS_FOR_TAG: (tagId: string) => ["persontags", "persons-for-tag", tagId],

  ENTRY_TAGS: (entryId: string) => ["entrytags", "tags-for-entry", entryId],
  TAGS_FOR_ENTRY: (entryId: string) => ["entrytags", "tags-for-entry", entryId],
  ENTRIES_FOR_TAG: (tagId: string) => ["entrytags", "entries-for-tag", tagId],

  PERSON_ENTRIES: (personId: string) => ["personentry", "entries-for-person", personId],
  ENTRIES_FOR_PERSON: (personId: string) => ["personentry", "entries-for-person", personId],
  PERSONS_FOR_ENTRY: (entryId: string) => ["personentry", "persons-for-entry", entryId],

  MEDIA_ENTRIES: (entryId: string) => ["mediaentry", "media-for-entry", entryId],
  MEDIA_FOR_ENTRY: (entryId: string) => ["mediaentry", "media-for-entry", entryId],
  ENTRIES_FOR_MEDIA: (mediaId: string) => ["mediaentry", "entries-for-media", mediaId],

  PERSON_RELATIONS_FROM: (personId: string) => ["personrelation", "from", personId],
  PERSON_RELATIONS_TO: (personId: string) => ["personrelation", "to", personId],
} as const;

// Common validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_DATE: "Invalid date format",
  INVALID_EMAIL: "Invalid email format",
} as const;

// Common UI labels
export const UI_LABELS = {
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",
  EDIT: "Edit",
  ADD: "Add",
  REMOVE: "Remove",
  CONFIRM: "Confirm",
  BACK: "Back",
  LOADING: "Loading...",
  ERROR: "Error",
  SEARCH: "Search",
  ERROR_LOADING_DATA: "Error loading data.",
  NO_RESULTS_FOUND: "No results found",
  ADD_NEW: "Add New",
  NEW: "New",
  VIEW_DETAILS: "View details",
  CREATE: "Create",
  PREVIOUS: "Prev",
  NEXT: "Next",
  PAGE: "Page",
  TOTAL: "Total",
  NO_TITLE: "(no title)",
  ERROR_LOADING: "Error loading",
  ERROR_UPDATING: "Error updating",
  ENTRY_NOT_FOUND: "Entry not found",
  TYPE: "Type:",
  TITLE: "Title:",
  CONTENT: "Content:",
  OCCURRED_AT: "Occurred At:",
  MEDIA_TYPE: "Media type:",
  MIME_TYPE: "MIME type:",
  TAKEN_AT: "Taken at:",
  NOTE: "Note:",
  TITLE_PLACEHOLDER: "Title",
  DELETE_CONFIRM_PREFIX: "Are you sure you want to delete",
  DELETE_CONFIRM_SUFFIX: "?",
} as const;

// Application routes
export const ROUTES = {
  HOME: "/",
  PERSONS: "/persons",
  PERSON_DETAIL: "/persons/:id",
  PERSON_EDIT: "/persons/:id/edit",
  TAGS: "/tags",
  ENTRIES: "/entries",
  ENTRY_DETAIL: "/entries/:id",
  MEDIA: "/media",
  MEDIA_DETAIL: "/media/:id",
  TEST: "/test",
  TEST_DETAIL: "/test/:id",
} as const;