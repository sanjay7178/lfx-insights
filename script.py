import re

def clean_mentor_name(line):
    """
    Cleans a mentor line.
    Input: "- Name Surname (@handle, email)"
    Output: "Name Surname"
    """
    # Remove leading bullets (- or *) and whitespace
    line = re.sub(r'^[-*]\s+', '', line).strip()
    
    # Stop reading the name at the first occurrence of '(', '<', or '@'
    # This removes (@handle), <email>, @handle
    name_part = re.split(r'[\(<@]', line)[0]
    
    return name_part.strip()

def parse_readme(content):
    projects = []
    lines = content.split('\n')
    
    current_org = ""
    current_project = None
    capturing_mentors = False
    
    # Regex patterns
    org_pat = re.compile(r'^###\s+(?!#)(.+)')      # Matches "### Organization"
    proj_pat = re.compile(r'^####\s+(.+)')          # Matches "#### Project"
    mentor_start_pat = re.compile(r'^[-*]?\s*Mentors?\s*:?', re.IGNORECASE)
    
    # Stop patterns - lines that definitely end the mentor section
    stop_pat = re.compile(r'^(Upstream Issue|LFX URL|#)', re.IGNORECASE)
    lfx_url_pat = re.compile(r'LFX URL:\s*(.+)', re.IGNORECASE)

    # Headers to ignore if caught by ###
    ignore_headers = ["Timeline", "Project instructions", "Application instructions"]

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # 1. Check for Organization Header
        org_match = org_pat.match(line)
        if org_match:
            header = org_match.group(1).strip()
            if header not in ignore_headers:
                current_org = header
            capturing_mentors = False
            continue

        # 2. Check for Project Title
        proj_match = proj_pat.match(line)
        if proj_match:
            # Save previous project
            if current_project and current_project.get('url'):
                projects.append(current_project)
            
            title = proj_match.group(1).strip()
            
            current_project = {
                "org": current_org,
                "title": title,
                "mentors": [],
                "url": "",
                "mentee": ""
            }
            capturing_mentors = False
            continue

        # 3. Check for start of Mentors section
        if mentor_start_pat.match(line):
            capturing_mentors = True
            continue

        # 4. Capture Mentors (CRITICAL LOGIC HERE)
        if capturing_mentors:
            # STRICT CHECK: If line starts with Upstream Issue or LFX URL, STOP capturing.
            if stop_pat.match(line):
                capturing_mentors = False
                # Do not `continue` here, because this line might be the LFX URL line we need below
            else:
                # Only process bullet points
                if line.startswith("-") or line.startswith("*"):
                    name = clean_mentor_name(line)
                    if name and current_project:
                        current_project['mentors'].append(name)

        # 5. Capture LFX URL
        url_match = lfx_url_pat.search(line)
        if url_match and current_project:
            current_project['url'] = url_match.group(1).strip()
            capturing_mentors = False # Ensure we stop capturing mentors

    # Append the final project
    if current_project and current_project.get('url'):
        projects.append(current_project)

    return projects

def generate_table(projects):
    # Markdown Header
    output = "| Project | Mentors | Mentee |\n"
    output += "| --- | --- | --- |\n"

    for p in projects:
        # 1. Project Column: [CNCF - Org: Title (2025 Term 3)](URL)
        # Remove any existing "(2025 ...)" from title to avoid duplicates
        clean_title = re.sub(r'\s*\(2025.*\)', '', p['title'])
        display_text = f"CNCF - {p['org']}: {clean_title} (2025 Term 3)"
        project_col = f"[{display_text}]({p['url']})"
        
        # 2. Mentors Column: Names only, comma separated
        mentors_col = ", ".join(p['mentors'])
        
        # 3. Mentee Column: Empty
        mentee_col = " "

        output += f"| {project_col} | {mentors_col} | {mentee_col} |\n"
    
    return output



with open('README (1).md', 'r', encoding='utf-8') as f:
    raw_data = f.read()

# Using the data from your prompt:

projects = parse_readme(raw_data)
table = generate_table(projects)

print(table)