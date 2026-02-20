export interface VoiceCommand {
    type: 'punctuation' | 'formatting' | 'edit' | 'text';
    value: string;
}

const punctuationMap: Record<string, string> = {
    'period': '. ',
    'comma': ', ',
    'question mark': '? ',
    'exclamation point': '! ',
    'exclamation mark': '! ',
    'colon': ': ',
    'semicolon': '; ',
    'dash': ' - ',
    'hyphen': '-',
    'quote': '"',
    'apostrophe': "'",
    'open parenthesis': '(',
    'close parenthesis': ')',
    'open bracket': '[',
    'close bracket': ']',
}

const formattingMap: Record<string, string> = {
    'new line': '\n',
    'new paragraph': '\n\n',
    'line break': '\n',
    'paragraph break': '\n\n',
    'tab': '\t',
}

const editCommands = ['delete that', 'scratch that', 'undo', 'clear', 'remove that']

export function parseVoiceCommand(text: string): VoiceCommand {
    const lowerText = text.toLowerCase().trim()
    if (punctuationMap[lowerText]) return { type: 'punctuation', value: punctuationMap[lowerText] }
    if (formattingMap[lowerText]) return { type: 'formatting', value: formattingMap[lowerText] }
    if (editCommands.includes(lowerText)) return { type: 'edit', value: lowerText }
    return { type: 'text', value: text }
}

export function applyEditCommand(
    command: string,
    currentText: string,
    history: string[]
): { text: string; newHistory: string[] } {
    switch (command) {
        case 'delete that':
        case 'scratch that':
        case 'remove that': {
            const sentences = currentText.split(/([.!?]\s+)/)
            if (sentences.length > 2) {
                sentences.splice(-2, 2)
                return { text: sentences.join(''), newHistory: [...history, currentText] }
            }
            const words = currentText.trim().split(' ')
            if (words.length > 5) {
                words.splice(-5)
                return { text: words.join(' ') + ' ', newHistory: [...history, currentText] }
            }
            return { text: '', newHistory: [...history, currentText] }
        }
        case 'undo': {
            if (history.length > 0) {
                const previousText = history[history.length - 1]
                return { text: previousText, newHistory: history.slice(0, -1) }
            }
            return { text: currentText, newHistory: history }
        }
        case 'clear':
            return { text: '', newHistory: [...history, currentText] }
        default:
            return { text: currentText, newHistory: history }
    }
}

export function capitalizeFirstLetter(text: string): string {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function smartCapitalization(text: string, previousText: string): string {
    if (!previousText || /[.!?]\s*$/.test(previousText)) {
        return capitalizeFirstLetter(text)
    }
    return text
}

export function shouldAddSpace(previousChar: string, nextChar: string): boolean {
    if (!previousChar) return false
    const noSpaceBefore = ['.', ',', '!', '?', ':', ';', ')', ']', "'"]
    const noSpaceAfter = ['(', '[', '"']
    if (noSpaceBefore.includes(nextChar)) return false
    if (noSpaceAfter.includes(previousChar)) return false
    if (previousChar === '\n') return false
    return true
}
