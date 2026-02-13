# Apple Design Principles

Apple’s design principles center on creating intuitive, minimalist, and deeply user-centric products that blend aesthetic beauty with seamless functionality. Key tenets include simplicity (less is more), consistency across devices, deep integration of hardware/software, and providing immediate feedback to ensure a respectful and engaging experience.

## Key Design Principles (Human Interface Guidelines)

- **Aesthetic Integrity**: The appearance of an app or product should directly reflect its function.
- **Consistency**: Using familiar, standard UI elements to ensure a predictable experience across all devices.
- **Direct Manipulation**: Allowing users to interact directly with on-screen content (e.g., pinching to zoom) rather than using intermediate controls.
- **Feedback**: Providing immediate, clear, and subtle feedback to acknowledge actions and demonstrate app status.
- **Simplicity/Minimalism**: Focusing on essential functionality by stripping away unnecessary elements to reduce user frustration.
- **User Control**: Empowering the user, not the software, to make decisions, while providing necessary guardrails.
- **Metaphors**: Using familiar, real-world concepts in the interface to help users quickly learn how to use new tools.
- **Hierarchy**: Organizing content with clear, structured layouts that elevate important information.

## Core Design Philosophies

- **Human-Centric**: Designing to positively impact the lives of users.
- **Form and Function**: Ensuring products are not just functional but also aesthetically pleasing.
- **Attention to Detail**: Meticulous care in every element to create a "magical" experience.

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