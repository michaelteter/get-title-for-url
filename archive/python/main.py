import os
import time
import requests
import sqlite3
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urlunparse


def remove_fragment(url):
    parsed_url = urlparse(url)
    # Create a new ParseResult without the fragment, and then convert it back to a URL string
    cleaned_url = parsed_url._replace(fragment="")
    return urlunparse(cleaned_url)


def get_title(url):
    try:
        response = requests.get(url)
        final_url = response.url
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.head.title.string
        return {'title': title, 'final_url': final_url}
    except Exception as e:
        print(f'Error fetching the URL: {str(e)}')
        return {'title': '', 'final_url': ''}


def read_filtered_links():
    with sqlite3.connect('/Users/mteter/.links.db') as conn:
        cursor = conn.cursor()
        query = '''
            SELECT *
            FROM km_links
            WHERE title is null or LENGTH(title) = 0;
        '''
        cursor.execute(query)
        rows = cursor.fetchall()
    return rows

# Function to update the km_links table


def update_links(url, title, final_url):
    with sqlite3.connect('/Users/mteter/.links.db') as conn:
        cursor = conn.cursor()
        query = '''
            UPDATE km_links
            SET title = ?, final_url = ?
            WHERE url = ?;
        '''
        cursor.execute(query, (title, final_url, url))
        conn.commit()
        if cursor.rowcount == 0:
            print(f'No rows updated for URL: {url}')
            # (URL: {url}, Title: {title}, Final URL: {final_url})')
            # print(f'Updated row.')


def main():
    # Call the read_filtered_links function and store the result in a variable
    filtered_rows = read_filtered_links()

    # Loop through the filtered_rows
    for row in filtered_rows:
        title_data = get_title(row[3])  # Assuming row[1] contains the URL
        time.sleep(1)
        update_links(row[3], title_data['title'], title_data['final_url'])
        print(".", end='', flush=True)


# Call the main function
main()
print("")
