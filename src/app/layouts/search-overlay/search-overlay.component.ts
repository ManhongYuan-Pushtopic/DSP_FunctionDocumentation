import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-overlay',
  templateUrl: './search-overlay.component.html',
  styleUrls: ['./search-overlay.component.css'],
})
export class SearchOverlayComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  selectedTags: string[] = [];
  tags: string[] = [];
  suggestions: any[] = [];
  filteredSuggestions: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>('assets/data/tags.json').subscribe((data) => {
      this.suggestions = data.map((item) => ({
        name: item['Item Name'],
        Tags: item['Tags'],
        route: item['Item Name'].toLowerCase().replace(/\s+/g, '_'),
      }));

      const tagSet = new Set<string>();
      this.suggestions.forEach((item) =>
        item.Tags.forEach((tag: string) => tagSet.add(tag))
      );
      this.tags = Array.from(tagSet);

      const preferredOrder = [
        'Date & Time',
        'Text',
        'Number',
        'Logical',
        'Trigger',
        'Type Processing',
        'Randomization',
        'Operators',
        'Global Variables',
        'Advanced',
      ];
      this.tags.sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a);
        const bIndex = preferredOrder.indexOf(b);
  
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
  
        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b);
        }
        return aIndex === -1 ? 1 : -1;
      });
    });
  }

  onSelectSuggestion(item: any) {
    this.router.navigate(['/docs', item.route]);
    this.close();
  }

  toggleTag(tag: string) {
    const i = this.selectedTags.indexOf(tag);
    i >= 0 ? this.selectedTags.splice(i, 1) : this.selectedTags.push(tag);
    this.filterSuggestions();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedTags = [];
    this.filterSuggestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      setTimeout(() => {
        this.searchInputRef?.nativeElement?.focus();
      }, 0);
    }
  }

  close() {
    this.closed.emit();
  }

  filterSuggestions() {
    const query = this.searchQuery.trim().toLowerCase();

    if(query) {
      // when there is input, only return functions with a matching name
      this.filteredSuggestions = this.suggestions.filter((item) => {
        const itemTags = item.Tags || [];
        const isNameMatch = item.name.toLowerCase().includes(query);
        const matchesSelectedTags =
          this.selectedTags.length === 0 ||
          this.selectedTags.some((tag: string) => itemTags.includes(tag));
        return isNameMatch && matchesSelectedTags;
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

       
        return aName.indexOf(query) - bName.indexOf(query);
      }
      );
    } else {
      this.filteredSuggestions = this.suggestions.filter((item) => {
        const itemTags = item.Tags || [];
        return (
          this.selectedTags.length === 0 ||
          this.selectedTags.some((tag: string) => itemTags.includes(tag))
        );
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aDollar = aName.startsWith('$');
        const bDollar = bName.startsWith('$');
        if (aDollar && !bDollar) return 1;
        if (!aDollar && bDollar) return -1;

        return aName.localeCompare(bName);
      });
    }
  }
}
  