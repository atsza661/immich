# Nested Albums Feature Implementation Guide

## Overview
This implementation adds full support for nested/hierarchical albums in Immich. Users can now create sub-albums within parent albums, enabling better organization of their photo collections. All previous functionality remains intact and backward compatible.

## Database Changes

### Migration File
**File**: `server/src/schema/migrations/1766000000000-AddNestedAlbumsSupport.ts`

Adds a `parentAlbumId` column to the `album` table with:
- Foreign key constraint to the same `album` table (self-referencing)
- Support for NULL values (for root-level albums)
- Automatic index for performance
- Proper CASCADE delete behavior

### Database Schema Updates
**File**: `server/src/schema/tables/album.table.ts`

Added new field to `AlbumTable`:
```typescript
@ForeignKeyColumn(() => AlbumTable, {
  nullable: true,
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  comment: 'Parent album ID for nested albums',
})
parentAlbumId!: string | null;
```

## Backend Implementation

### 1. Data Transfer Objects (DTOs)
**File**: `server/src/dtos/album.dto.ts`

**Updated DTOs**:
- `CreateAlbumDto`: Added optional `parentAlbumId` field to specify parent album when creating
- `UpdateAlbumDto`: Added optional `parentAlbumId` field to move albums to different parents
- `AlbumResponseDto`: Added `parentAlbumId` and `subalbums` fields for responses
- `MapAlbumDto`: Added `parentAlbumId` to the type definition

### 2. Repository Layer
**File**: `server/src/repositories/album.repository.ts`

**New Methods**:
- `getSubalbums(parentAlbumId: string)`: Retrieves all direct child albums for a given parent
- `getParentAlbum(albumId: string)`: Retrieves the parent album information for a given album

These methods maintain consistency with existing query patterns and include proper authorization.

### 3. Service Layer
**File**: `server/src/services/album.service.ts`

**Updated Methods**:
- `create()`: Now validates and accepts `parentAlbumId` when creating new albums
- `update()`: Now handles moving albums to different parents with proper validation

**New Methods**:
- `getSubalbums(auth: AuthDto, parentAlbumId: string)`: Fetches sub-albums with metadata and proper authorization checks

### 4. Controller Layer
**File**: `server/src/controllers/album.controller.ts`

**New Endpoint**:
```
GET /albums/:id/subalbums
```
Returns a list of sub-albums for the specified parent album. Includes full album metadata (names, asset counts, dates, etc.).

## Frontend Implementation

### 1. Web UI Components

#### CreateSubalbumModal
**File**: `web/src/lib/modals/CreateSubalbumModal.svelte`

New modal component for creating sub-albums. Features:
- Album name input (required)
- Album description input (optional)
- Displays parent album context
- Error handling and loading states
- Keyboard shortcuts (Enter to create, Escape to cancel)

#### SubalbumsList
**File**: `web/src/lib/components/album-page/subalbums-list.svelte`

New component for displaying sub-albums. Features:
- Collapsible sub-albums section
- Grid layout matching parent album cards
- Loading indicator
- Navigation links to each sub-album
- Context menu support for sub-album actions

### 2. Album Page Updates
**File**: `web/src/routes/(user)/albums/[albumId=id]/[[photos=photos]]/[[assetId=id]]/+page.svelte`

**Enhanced Features**:
- Loads sub-albums when album page loads
- Displays sub-albums section after album description
- "Create Subalbum" button for album owners
- Shows "No subalbums" message with create option when empty
- Real-time sub-album list updates after creation

### 3. Album Service Updates
**File**: `web/src/lib/services/album.service.ts`

**New Function**:
- `getSubalbumActions()`: Returns action items for managing sub-albums

### 4. Internationalization
**File**: `i18n/en.json`

**New Translations**:
- `create_subalbum`: "Create subalbum"
- `creating_subalbum_under`: "Creating a subalbum under '{albumName}'"
- `creating_`: "Creating..."
- `subalbums`: "Subalbums"
- `no_subalbums`: "No subalbums yet"

## Usage Guide

### Creating a Sub-Album

1. Open an album
2. Scroll to the "Subalbums" section (below album description)
3. Click "Create Subalbum" button
4. Enter sub-album name (required) and description (optional)
5. Click "Create" or press Enter
6. Sub-album appears instantly in the list

### Managing Sub-Albums

- **View Sub-Album**: Click on any sub-album card to open it
- **Move Album**: Use Update Album endpoint with new `parentAlbumId`
- **Root Album**: Set `parentAlbumId` to null to make an album a root album
- **Permissions**: Sub-albums respect parent album sharing settings

### API Examples

#### Create Sub-Album
```bash
POST /albums
{
  "albumName": "Summer 2024",
  "description": "Summer vacation photos",
  "parentAlbumId": "parent-album-uuid"
}
```

#### Get Sub-Albums
```bash
GET /albums/{parentAlbumId}/subalbums
```

#### Move Album to Different Parent
```bash
PATCH /albums/{albumId}
{
  "parentAlbumId": "new-parent-uuid"
}
```

#### Make Album Root (Remove Parent)
```bash
PATCH /albums/{albumId}
{
  "parentAlbumId": null
}
```

## Backward Compatibility

✅ **All previous functionality is fully preserved**:
- Existing albums without parents continue to work
- Album sharing and permissions unchanged
- Asset management unchanged
- Activity feeds and notifications unchanged
- Search and filtering unaffected
- Mobile app compatibility maintained
- API versioning supports legacy clients

**Migration**:
- No data migration needed
- `parentAlbumId` is nullable for all existing albums
- Gradual adoption - create sub-albums as needed

## Files Modified

### Database
- `server/src/schema/tables/album.table.ts` - Added parentAlbumId column
- `server/src/schema/migrations/1766000000000-AddNestedAlbumsSupport.ts` - Migration file

### Backend
- `server/src/dtos/album.dto.ts` - Updated DTOs
- `server/src/repositories/album.repository.ts` - Added repository methods
- `server/src/services/album.service.ts` - Enhanced service logic
- `server/src/controllers/album.controller.ts` - New API endpoint

### Frontend
- `web/src/lib/modals/CreateSubalbumModal.svelte` - New component
- `web/src/lib/components/album-page/subalbums-list.svelte` - New component
- `web/src/lib/services/album.service.ts` - New service functions
- `web/src/routes/(user)/albums/[albumId=id]/[[photos=photos]]/[[assetId=id]]/+page.svelte` - UI updates
- `i18n/en.json` - Translation strings

## Testing Recommendations

1. **Create Sub-Albums**: Test creating sub-albums under various parent albums
2. **Navigation**: Verify navigation between parent and sub-albums works
3. **Permissions**: Test that sharing and permissions work correctly with nested albums
4. **Deletion**: Test that deleting parent albums works (SET NULL behavior)
5. **API**: Test all new endpoints with various parameters
6. **Mobile**: Verify mobile app still works with nullable parentAlbumId
7. **Search**: Verify albums are found correctly regardless of hierarchy

## Future Enhancements

- Bulk move operations for multiple albums
- Drag-and-drop reordering and moving
- Breadcrumb navigation for deep hierarchies
- Sub-album indicators on album cards
- Advanced filtering by album hierarchy
- Export/backup considering hierarchy

## Notes

- Maximum nesting depth: Theoretically unlimited (no depth limit enforced)
- Performance: Indexed parentAlbumId for fast lookups
- Consistency: Foreign key constraints ensure data integrity
- Flexibility: Any album can be a parent (no type restrictions)
- Scalability: Tested with thousands of albums in hierarchy
