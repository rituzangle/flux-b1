# ADR-001: Eye-Friendly Design Tokens

**Status:** Accepted  
**Date:** October 12, 2025  
**Deciders:** Lead Developer

## Context
Target users include near-sighted, eye-fatigued, and older adults. Standard pure-white backgrounds and small text cause strain during long sessions.

## Decision
Use warm off-white backgrounds (#fafaf9) with true black text (#0a0a0a) for 7:1 contrast. Minimum 16px body text with 1.6 line-height. Generous spacing throughout.

## Consequences
**Positive:**
- Reduces eye strain for all users
- Better accessibility for vision-impaired
- Longer comfortable session times
- AAA WCAG compliance

**Negative:**
- Slightly less "modern" than pure white designs
- May need to educate users on design choice

## Alternatives Considered
- Pure white backgrounds: Rejected (too harsh)
- Dark mode only: Rejected (not everyone prefers)
- System preference: Future enhancement

## References
- WCAG 2.2 AAA contrast requirements
- Research on eye strain and typography

