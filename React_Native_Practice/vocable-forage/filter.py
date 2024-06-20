def filter_words(input_file, output_file):
    with open(input_file, 'r') as file:
        words = file.readlines()

    filtered_words = []

    for word in words:
        word = word.strip()  # Remove any leading/trailing whitespace
        if len(word) < 3 or len(word) > 9:
            continue

        letter_counts = {}
        valid_word = True
        for letter in word:
            if letter in letter_counts:
                letter_counts[letter] += 1
                if letter_counts[letter] > 2:
                    valid_word = False
                    break
            else:
                letter_counts[letter] = 1

        if valid_word:
            filtered_words.append(word)

    with open(output_file, 'w') as file:
        for word in filtered_words:
            file.write(f"{word}\n")
    print(len(filtered_words))
# Specify the input and output file paths
input_file = 'assets/word-list.txt'
output_file = 'assets/filtered-word-list.txt'

# Call the function to filter the words
filter_words(input_file, output_file)
