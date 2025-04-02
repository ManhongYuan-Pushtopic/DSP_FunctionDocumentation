import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


interface Parameter {
    name: string;
    type: string;
    required: string;
    description: string;
  }

export interface DocData {
    title: string;
    description?: string;
    syntax?: string;
    parameters?: Parameter[];
    examples?: string[];
    tips?: string[];
    relatedFormulas?: string[];
    operators?: {
      [category: string]: {
        operator: string;
        name: string;
        description: string;
      }[];
    }
  }


@Injectable({
    providedIn: 'root'
})

export class DocsService {
    constructor(private http: HttpClient) {}
  
  
    getDocByName(docName: string): Observable<DocData | null> {
      const url = `assets/functions/${docName}.json`;
      return this.http.get<DocData>(url).pipe(
        catchError(error => {
          console.error(`Error loading ${url}:`, error);
          return of(null);
        })
      );
    }
  }