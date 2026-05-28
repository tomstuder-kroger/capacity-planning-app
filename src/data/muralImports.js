// Each batch has a unique id — once applied it is never re-applied.
// To import a new mural image: add a new entry to this array.
// Sizes: Small = 2w, Medium = 4w, Large = 8w, Extra Large = 9w

export const muralImports = [
  {
    id: 'promotions-q2-2026-v1',
    domain: 'Promotions',
    people: [
      {
        name: 'Chelsea',
        projects: [
          { title: 'Contributing to Contracts team', weeks: 2 },
          { title: 'Merch hub transition', weeks: 4 },
          { title: 'Multi week offers (MVP)', weeks: 4 },
          { title: 'Visibility into promotion changes within Ad Plan Manager (Discovery)', weeks: 9 }
        ]
      }
    ]
  }
];
