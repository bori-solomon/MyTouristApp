# Changelog

All notable changes to this project will be documented in this file.

## [v1.2.2] - 2026-02-20

### Fixed
- **Landing Page Image**: Refactored the landing page to use `next/image` for more reliable background image loading and added a fallback theme-aware background color.

## [v1.2.1] - 2026-02-20

### Fixed
- **UI Visibility**: Increased trip header window size in edit mode to prevent date labels and "Save" button from being cut off.

## [v1.2] - 2026-02-20

### Added
- **Flight Details**: Added flight hours (start-end) for both outbound and return flights.
- **Trip Comments**: Added an optional comment field for general trip notes.

## [v1.1] - 2026-02-15

### Added
- **Editable Trip Details**: Added ability to edit "From Date", "To Date", and "People" directly on the trip page.
- **Performance Improvements**: Optimized dashboard loading with parallel data fetching.
- **Loading States**: Added "Loading..." indicators for better user experience during navigation.
- **Version Display**: Added version number to the top navigation bar.

### Fixed
- Fixed "stuck" navigation when going back to the dashboard.
- Fixed 502 Bad Gateway error by updating local environment configuration.
- Improved error handling and logging for Google Drive API interactions.
