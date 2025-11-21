import { Project } from '../types';
import { MARKDOWN_DATA } from './rawData';

export const parseMarkdownData = (): Project[] => {
  const lines = MARKDOWN_DATA.split('\n');
  const projects: Project[] = [];
  let currentYear = 0;
  let currentTerm = '';

  // Regex helpers
  const yearRegex = /^#{4}\s(\d{4})/;
  const termRegex = /^#{5}\s(.*?)$/;
  
  // Table row detection
  const isTableRow = (line: string) => line.trim().startsWith('|') && line.includes('|') && !line.includes('---');

  // Extract project link: [Title](URL)
  const linkRegex = /\[(.*?)\]\((.*?)\)/;

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // 1. Detect Year
    const yearMatch = trimmed.match(yearRegex);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1], 10);
      return; 
    }

    // 2. Detect Term
    const termMatch = trimmed.match(termRegex);
    if (termMatch) {
      let termRaw = termMatch[1];
      if(termRaw.includes(':')) {
         termRaw = termRaw.split(':')[0].trim();
      }
      
      // Normalize: Remove year prefix if present (e.g. "2025 Term 1" -> "Term 1")
      // This allows filtering by "Term 1" across multiple years
      termRaw = termRaw.replace(/^\d{4}\s+/, '');

      currentTerm = termRaw;
      return;
    }

    // 3. Parse Table Row
    if (isTableRow(trimmed)) {
        // Split by pipe. Markdown tables typically start and end with a pipe.
        const rawCells = trimmed.split('|');
        
        // Remove first empty string if line starts with pipe
        if (rawCells.length > 0 && rawCells[0].trim() === '') rawCells.shift();
        // Remove last empty string if line ends with pipe
        if (rawCells.length > 0 && rawCells[rawCells.length - 1].trim() === '') rawCells.pop();
        
        const cols = rawCells.map(c => c.trim());

        // We accept rows with at least 2 columns (Project, Mentors)
        // If the Mentee column is empty, cols[2] might be undefined or empty string depending on split
        if (cols.length >= 2) {
            const projectCol = cols[0];
            const mentorsCol = cols[1];
            const menteeCol = cols[2] || ''; // Handle empty or missing mentee column

            // Skip header row
            if (projectCol.toLowerCase() === 'project' || projectCol.includes('---')) return;

            // Extract Link and Title
            const linkMatch = projectCol.match(linkRegex);
            let title = projectCol;
            let url = '';
            
            if (linkMatch) {
                title = linkMatch[1];
                url = linkMatch[2];
            }

            // Extract Organization from Title
            let organization = "Other";
            let cleanTitle = title;

            const cncfPrefix = "CNCF - ";
            if (title.startsWith(cncfPrefix)) {
                const withoutPrefix = title.substring(cncfPrefix.length);
                const separator = withoutPrefix.includes(':') ? ':' : (withoutPrefix.includes(' - ') ? ' - ' : null);
                
                if (separator) {
                    const parts = withoutPrefix.split(separator);
                    organization = parts[0].trim();
                    cleanTitle = parts.slice(1).join(separator).trim();
                } else {
                     organization = withoutPrefix.split(' ')[0]; 
                }
            } else {
                 if(title.includes(':')) {
                    organization = title.split(':')[0].trim();
                    cleanTitle = title.split(':').slice(1).join(':').trim();
                 }
            }
            
            // Clean up title
            cleanTitle = cleanTitle.replace(/\(\d{4} Term \d+\)/, '').trim();

            // Normalize Organization Names
            if (organization.includes('Kubernetes')) organization = 'Kubernetes';
            if (organization.includes('Knative')) organization = 'Knative';
            if (organization.includes('WasmEdge')) organization = 'WasmEdge';
            
            projects.push({
                id: Math.random().toString(36).substr(2, 9),
                year: currentYear || 2022,
                term: currentTerm || 'Unknown',
                organization: organization,
                title: cleanTitle,
                url: url,
                mentors: mentorsCol.split(',').map(m => m.trim()).filter(m => m),
                mentee: menteeCol,
                rawLine: trimmed
            });
        }
    }
  });

  return projects;
};