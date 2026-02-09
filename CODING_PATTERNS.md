# Coding Patterns - Court of Public Record

This document defines the coding standards and reusable patterns for the Court of Public Record project.

## UI Components

### Button Styling

The application uses a consistent button styling system based on semantic meaning and visual hierarchy.

#### Primary Action Buttons

Used for main actions (Save, Create, Update, etc.)

```tsx
<Button 
    type="submit" 
    disabled={saving}
    className="bg-primary text-primary-foreground"
>
    Save Changes
</Button>
```

**Properties:**
- Background: `bg-primary`
- Text: `text-primary-foreground`
- Automatically adapts to user's chosen theme color (blue, red, etc.)

#### Secondary/Cancel Buttons

Used for secondary actions, cancel operations, reset functions, and filter buttons.

```tsx
<button
    type="button"
    onClick={handleAction}
    disabled={disabled}
    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
>
    Cancel
</button>
```

**Properties:**
- Background: `bg-muted/50` (50% grey)
- Text: `text-foreground/80` (80% opacity black)
- Hover: `hover:bg-primary hover:text-primary-foreground` (turns to primary color)
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- **No borders** - Clean, modern appearance

**Use Cases:**
- Cancel buttons in modals
- Reset/Refresh buttons
- Unselected filter buttons
- Any secondary action that shouldn't be as prominent as primary buttons

#### Selected State (for toggleable buttons like filters)

```tsx
<button
    onClick={() => setSelected(true)}
    className="px-3 py-1.5 rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground"
>
    Active Filter
</button>
```

**Properties:**
- Background: `bg-primary`
- Text: `text-primary-foreground`
- Same as primary buttons but used in toggle contexts

### Example: Filter Buttons with Toggle

```tsx
{CATEGORIES.map(cat => (
    <button
        key={cat.id}
        onClick={() => setSelectedCategory(cat.id)}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-foreground/80 hover:bg-primary hover:text-primary-foreground'
        }`}
    >
        {cat.name}
    </button>
))}
```

## Table Styling

### Standard Data Table

Tables should use consistent styling with alternating row colors, sticky headers, and proper spacing.

```tsx
<div className="rounded-lg border bg-card overflow-hidden">
    <div className="overflow-auto max-h-[calc(100vh-240px)]">
        <table className="w-full border-collapse">
            <thead className="sticky top-0 z-40 bg-muted">
                <tr>
                    <th className="text-left p-3 font-semibold border-b min-w-[180px] bg-muted">
                        Column Name
                    </th>
                    <th className="text-center p-3 font-semibold border-b min-w-[120px] bg-muted">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}>
                        <td className="p-3 border-b">
                            <span className="text-sm">{item.name}</span>
                        </td>
                        <td className="p-3 border-b text-center">
                            {/* Actions */}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
```

**Key Properties:**

- **Container**: `rounded-lg border bg-card overflow-hidden`
- **Scroll wrapper**: `overflow-auto max-h-[calc(100vh-240px)]`
- **Table**: `w-full border-collapse`
- **Header**: `sticky top-0 z-40 bg-muted`
- **Header cells**: `text-left p-3 font-semibold border-b min-w-[180px] bg-muted`
- **Row alternating**: `idx % 2 === 0 ? 'bg-card' : 'bg-secondary'`
- **Data cells**: `p-3 border-b`

### Sticky First Column

For tables with many columns, make the first column sticky:

```tsx
<th className="text-left p-3 font-semibold border-b min-w-[250px] bg-muted sticky left-0 z-50">
    Permission
</th>
```

And in the body:

```tsx
<td className={`p-3 border-b sticky left-0 z-30 ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary'}`}>
    <span className="font-medium text-sm">{item.name}</span>
</td>
```

**Important:** The sticky column must have its own background color matching the row to avoid transparency issues.

### Empty State

```tsx
<tbody>
    {items.length === 0 ? (
        <tr>
            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No items found
            </td>
        </tr>
    ) : (
        // ... data rows
    )}
</tbody>
```

### Cell Alignment

- **Text data**: Left-aligned (`text-left`)
- **Actions/Icons**: Center-aligned (`text-center`)
- **Numbers**: Right-aligned (`text-right`)

```tsx
<th className="text-left ...">Text Column</th>
<th className="text-center ...">Actions</th>
<th className="text-right ...">Count</th>
```

### Interactive Cells (Checkboxes)

For editable tables with checkboxes:

```tsx
<td className="p-3 border-b text-center">
    <div className="flex items-center justify-center">
        <button
            onClick={() => togglePermission(roleId, permId)}
            className="relative group"
        >
            {isGranted ? (
                <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
                <XMarkIcon className="h-5 w-5 text-muted-foreground/30" />
            )}
            {isChanged(roleId, permId) && (
                <ExclamationCircleIcon className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
            )}
        </button>
    </div>
</td>
```

**Change Indicator:** Use a small yellow circle positioned absolutely for unsaved changes.

### Column Header with Icons

For role-based columns or specialized headers:

```tsx
<th className="p-3 border-b text-center min-w-[100px] bg-muted">
    <div className="flex flex-col items-center gap-1">
        <UserIcon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} />
        <span className="text-xs font-semibold">Role Name</span>
        <span className="text-[10px] text-muted-foreground">Subtitle</span>
    </div>
</th>
```

### Row Badge Example

```tsx
<td className="p-3 border-b">
    <div className="flex flex-wrap gap-1">
        {user.roles.map((role) => (
            <span
                key={role.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
            >
                <RoleIcon className="h-3 w-3" />
                <span>{role.name}</span>
            </span>
        ))}
    </div>
</td>
```

## Icons

### Icon Library

The project uses **Heroicons** (`@heroicons/react/24/outline`) for all icons to maintain a consistent, professional appearance.

**Do NOT use:**
- `lucide-react`
- Emoji characters (🔍, ⚙️, etc.)
- Other icon libraries

**Common Icon Imports:**

```tsx
import {
    UserIcon,
    Cog6ToothIcon,
    CheckIcon,
    XMarkIcon,
    ArrowPathIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
```

### Icon Sizing

- **Small icons** (in buttons): `className="h-4 w-4"`
- **Medium icons** (headers): `className="h-5 w-5"` or `className="h-6 w-6"`
- **Large icons** (loading states): `className="h-8 w-8"`

### Icon Color

Icons should use the theme's primary color for consistency:

```tsx
<ShieldCheckIcon 
    className="h-6 w-6" 
    style={{ color: 'hsl(var(--primary))' }} 
/>
```

## State Management Patterns

### Change Detection with Proper Deep Equality

When comparing state objects that may contain `undefined` vs `false` values, use normalized comparison:

```tsx
// Helper function to normalize grant value
const normalizeValue = (val: boolean | undefined): boolean => {
    return val === true
}

// Deep comparison
const hasChanges = useMemo(() => {
    const allRoleIds = new Set([...Object.keys(current), ...Object.keys(original)])
    
    for (const id of allRoleIds) {
        if (normalizeValue(current[id]) !== normalizeValue(original[id])) {
            return true
        }
    }
    
    return false
}, [current, original])
```

**Why:** `JSON.stringify()` treats `undefined` and `false` as different, leading to false positives in change detection.

## Theme Integration

### Using Theme Colors

Always use CSS custom properties for colors to ensure theme compatibility:

```tsx
// ✅ Good - Adapts to user's theme
style={{ backgroundColor: 'hsl(var(--primary))' }}
className="bg-primary text-primary-foreground"

// ❌ Bad - Hard-coded colors
style={{ backgroundColor: '#3b82f6' }}
className="bg-blue-500"
```

### Semantic Color Tokens

- `--primary` - User's chosen theme color
- `--primary-foreground` - Contrasting text on primary
- `--muted` - Subtle grey for backgrounds
- `--foreground` - Default text color
- `--destructive` - Error/delete actions

## Best Practices

### Consistency Over Customization

- Use established patterns from this document
- Don't create one-off button styles
- Maintain visual consistency across all admin pages

### Accessibility

- All interactive elements must have proper `disabled` states
- Use `disabled:opacity-50 disabled:cursor-not-allowed`
- Ensure sufficient color contrast

### Performance

- Use `useMemo` for expensive computations (filtering, sorting, comparisons)
- Avoid unnecessary re-renders with proper dependency arrays

---

**Last Updated:** 2026-02-09
**Maintainer:** Development Team
