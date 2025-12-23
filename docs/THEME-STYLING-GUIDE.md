# Theme Styling Guide - Consistent daisyUI Implementation

**Date:** 2025-01-27  
**Status:** ✅ Pattern Established

---

## Overview

All pages should use consistent daisyUI theming. This guide provides patterns and components to ensure uniformity across the application.

---

## Core Components

### PageWrapper

Use `PageWrapper` for consistent page layout:

```tsx
import { PageWrapper } from '@/components/layout/PageWrapper';

export default function MyPage() {
  return (
    <PageWrapper title="Page Title" description="Page description">
      {/* Your content */}
    </PageWrapper>
  );
}
```

### Card

Use the `Card` component for content containers:

```tsx
import { Card } from '@/components/ui/Card';

<Card title="Card Title" shadow="md">
  <p>Card content</p>
</Card>
```

### Button

Use the `Button` component for all buttons:

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" loading={isLoading}>
  Click Me
</Button>
```

### Input

Use the `Input` component for form fields:

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  helperText="Enter your email address"
/>
```

---

## Color System

Always use daisyUI semantic colors:

- **Primary**: `btn-primary`, `text-primary`, `bg-primary`
- **Secondary**: `btn-secondary`, `text-secondary`, `bg-secondary`
- **Accent**: `btn-accent`, `text-accent`, `bg-accent`
- **Success**: `btn-success`, `text-success`, `bg-success`
- **Warning**: `btn-warning`, `text-warning`, `bg-warning`
- **Error**: `btn-error`, `text-error`, `bg-error`
- **Info**: `btn-info`, `text-info`, `bg-info`

### Base Colors

- **Background**: `bg-base-100`, `bg-base-200`, `bg-base-300`
- **Text**: `text-base-content`, `text-base-content/70`, `text-base-content/60`

---

## Common Patterns

### Page Header

```tsx
<div className="mb-6 md:mb-8">
  <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
    Page Title
  </h1>
  <p className="text-base-content/70">Page description</p>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map((item) => (
    <Card key={item.id} title={item.title}>
      {item.content}
    </Card>
  ))}
</div>
```

### Alert Messages

```tsx
<div className="alert alert-info">
  <svg>...</svg>
  <span>Information message</span>
</div>

<div className="alert alert-success">
  <svg>...</svg>
  <span>Success message</span>
</div>

<div className="alert alert-warning">
  <svg>...</svg>
  <span>Warning message</span>
</div>

<div className="alert alert-error">
  <svg>...</svg>
  <span>Error message</span>
</div>
```

### Loading States

```tsx
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <div>{content}</div>
)}
```

### Empty States

```tsx
import { EmptyState } from '@/components/common/EmptyState';

<EmptyState
  icon="🔬"
  title="No biomarkers yet"
  description="Upload lab results to get started"
  action={{ label: 'Upload Results', href: '/biomarkers/upload' }}
/>
```

### Tables

```tsx
<div className="overflow-x-auto">
  <table className="table table-zebra w-full">
    <thead>
      <tr className="bg-base-200">
        <th className="text-base-content font-semibold">Column 1</th>
        <th className="text-base-content font-semibold">Column 2</th>
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.id} className="hover">
          <td>{row.value1}</td>
          <td>{row.value2}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Forms

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Name"
    type="text"
    {...register('name')}
    error={errors.name?.message}
  />
  
  <div className="form-control">
    <label className="label">
      <span className="label-text font-semibold">Select Option</span>
    </label>
    <select className="select select-bordered w-full" {...register('option')}>
      <option value="">Choose...</option>
      <option value="1">Option 1</option>
    </select>
  </div>
  
  <Button type="submit" loading={isSubmitting}>
    Submit
  </Button>
</form>
```

### Badges

```tsx
<div className="badge badge-success">Success</div>
<div className="badge badge-warning">Warning</div>
<div className="badge badge-error">Error</div>
<div className="badge badge-info">Info</div>
```

---

## Responsive Design

Always use mobile-first breakpoints:

- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

Example:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## Dark Mode

All components automatically support dark mode via daisyUI's theme system. No additional styling needed.

---

## Checklist for Page Updates

When updating a page, ensure:

- [ ] Uses `PageWrapper` or consistent container classes
- [ ] All buttons use `Button` component or `btn` classes
- [ ] All cards use `Card` component or `card` classes
- [ ] All inputs use `Input` component or `input` classes
- [ ] Colors use semantic daisyUI classes
- [ ] Responsive design (mobile-first)
- [ ] Loading states with `SkeletonCard`
- [ ] Empty states with `EmptyState`
- [ ] Error handling with alerts
- [ ] Consistent spacing and typography

---

## Migration Script

To quickly update existing pages:

1. Replace custom button classes with `btn btn-primary`
2. Replace custom card classes with `card bg-base-100 shadow-md`
3. Replace custom input classes with `input input-bordered`
4. Replace color classes with semantic daisyUI colors
5. Add `PageWrapper` for consistent layout
6. Add `MobileNav` for mobile navigation

---

**Status:** ✅ **Pattern Established**  
**Next Steps:** Apply to all pages systematically

