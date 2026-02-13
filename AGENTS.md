# Dropdown Implementation Guidelines

## Concept

Across the entire project, dropdowns follow this consistent pattern:

1. **Use catalog list API** to get list of id and names for entities
2. **Display `name`** in dropdowns and field selection for user-friendly experience
3. **Store `id`** in the model and when making API requests for proper identification
4. The UI shows user-friendly names, but the underlying data uses IDs

## Implementation Details

### Agent Form
- Model selection uses a dropdown populated from the catalog list API
- Shows model names to users for easy identification
- Stores model IDs internally when making API requests
- No manual ID entry fields needed - everything is handled through selection

### Model Form  
- Similar approach for any entity relationships
- Always prioritize user-friendly display names in UI
- Always use IDs for data storage and API communication

## Benefits

- **User Experience**: Users see meaningful names instead of opaque IDs
- **Data Integrity**: IDs ensure accurate entity references in the backend
- **Consistency**: Same pattern applied across all dropdowns in the application
- **Maintainability**: Centralized approach using catalog APIs

## API Integration

- `/v1/catalog/list` endpoint provides paginated lists of entities
- Each entity includes both `id` and `name` fields
- Frontend components use the `name` for display and `id` for data operations