import json
import random
import string
from datetime import date, timedelta

PUZZLE_SIZE = 9
MIN_WORD_LENGTH = 3
WORDLIST_PATH = "4LetterWords.txt"
PUZZLE_OUTPUT = "puzzles.json"
DAYS_AHEAD = 30  # Number of days to generate puzzles for


def generate_unique_letters(count=PUZZLE_SIZE):
    return random.sample(string.ascii_uppercase, count)


def load_words(min_length=MIN_WORD_LENGTH):
    with open(WORDLIST_PATH, "r") as f:
        return [w.strip().upper() for w in f if len(w.strip()) >= min_length]


def valid_words(wordlist, letters):
    valid = []
    for word in wordlist:
        temp_letters = list(letters)
        is_valid = True
        for char in word:
            if char in temp_letters:
                temp_letters.remove(char)
            else:
                is_valid = False
                break
        if is_valid:
            valid.append(word)
    return valid


def generate_puzzle(seed_date):
    random.seed(seed_date.toordinal())  # Deterministic seed based on date
    letters = generate_unique_letters()
    wordlist = load_words()
    words = valid_words(wordlist, letters)
    return {
        "letters": letters,
        "words": words
    }


def generate_puzzles(start_date, num_days):
    try:
        with open(PUZZLE_OUTPUT, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}

    for i in range(num_days):
        current_date = start_date + timedelta(days=i)
        key = current_date.isoformat()
        if key not in data:
            puzzle = generate_puzzle(current_date)
            data[key] = puzzle

    with open(PUZZLE_OUTPUT, "w") as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    today = date.today()
    generate_puzzles(today, DAYS_AHEAD)
