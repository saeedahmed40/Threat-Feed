import kivy
kivy.require('1.11.1')
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.scrollview import ScrollView
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.network.urlrequest import UrlRequest
from kivy.core.window import Window
from kivy.utils import platform
import feedparser
import webbrowser
import re

class NewsApp(App):
    def build(self):
        # Set up the main layout
        main_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Title Label for News
        news_title_label = Label(text='Latest News', font_size='20sp', size_hint_y=None, height=50)
        main_layout.add_widget(news_title_label)

        # TextInput for RSS feed URL input (News)
        self.news_url_input = TextInput(hint_text="Enter News RSS feed URL", multiline=False, size_hint_y=None, height=40)
        main_layout.add_widget(self.news_url_input)

        # Button to load the RSS feed (News)
        news_load_button = Button(text="Load News", size_hint_y=None, height=40)
        news_load_button.bind(on_release=self.load_news_feed)
        main_layout.add_widget(news_load_button)

        # ScrollView for displaying the news articles
        self.news_scrollview = ScrollView(size_hint=(1, None), size=(Window.width, Window.height / 2 - 100))
        self.news_layout = BoxLayout(orientation='vertical', spacing=10, padding=10, size_hint_y=None)
        self.news_layout.bind(minimum_height=self.news_layout.setter('height'))
        self.news_scrollview.add_widget(self.news_layout)
        main_layout.add_widget(self.news_scrollview)

        # Separator
        main_layout.add_widget(Label(size_hint_y=None, height=20))

        # Title Label for Podcasts
        podcast_title_label = Label(text='Latest Podcasts', font_size='20sp', size_hint_y=None, height=50)
        main_layout.add_widget(podcast_title_label)

        # TextInput for RSS feed URL input (Podcasts)
        self.podcast_url_input = TextInput(hint_text="Enter Podcast RSS feed URL", multiline=False, size_hint_y=None, height=40)
        main_layout.add_widget(self.podcast_url_input)

        # Button to load the RSS feed (Podcasts)
        podcast_load_button = Button(text="Load Podcasts", size_hint_y=None, height=40)
        podcast_load_button.bind(on_release=self.load_podcast_feed)
        main_layout.add_widget(podcast_load_button)

        # ScrollView for displaying the podcast episodes
        self.podcast_scrollview = ScrollView(size_hint=(1, None), size=(Window.width, Window.height / 2 - 100))
        self.podcast_layout = BoxLayout(orientation='vertical', spacing=10, padding=10, size_hint_y=None)
        self.podcast_layout.bind(minimum_height=self.podcast_layout.setter('height'))
        self.podcast_scrollview.add_widget(self.podcast_layout)
        main_layout.add_widget(self.podcast_scrollview)

        return main_layout

    def load_news_feed(self, instance):
        rss_feed_url = self.news_url_input.text.strip()
        
        if not self.validate_url(rss_feed_url):
            self.show_error_popup("Invalid URL. Please enter a valid News RSS feed URL.")
            return

        # Request the RSS feed for News with timeout and error handling
        UrlRequest(rss_feed_url, on_success=self.parse_news_feed, on_error=self.on_request_error, timeout=10)

    def load_podcast_feed(self, instance):
        rss_feed_url = self.podcast_url_input.text.strip()
        
        if not self.validate_url(rss_feed_url):
            self.show_error_popup("Invalid URL. Please enter a valid Podcast RSS feed URL.")
            return

        # Request the RSS feed for Podcasts with timeout and error handling
        UrlRequest(rss_feed_url, on_success=self.parse_podcast_feed, on_error=self.on_request_error, timeout=10)

    def validate_url(self, url):
        # Basic URL validation using regex
        regex = re.compile(
            r'^(?:http|https)://' # http:// or https://
            r'\w+(?:\.\w+)+(?:[\/\?#]\S*)?$', re.IGNORECASE)
        return re.match(regex, url) is not None

    def parse_news_feed(self, req, result):
        feed = feedparser.parse(result)
        if feed.bozo:
            self.show_error_popup("Failed to parse RSS feed. Please check the URL.")
            return
        
        self.news_layout.clear_widgets()  # Clear previous news articles

        for entry in feed.entries:
            article_layout = BoxLayout(orientation='horizontal', size_hint_y=None, height=40)

            article_title = Label(text=entry.title, text_size=(Window.width - 150, None), halign='left', valign='middle')
            article_layout.add_widget(article_title)

            open_button = Button(text='Open', size_hint=(None, None), size=(100, 40))
            open_button.bind(on_release=lambda btn, url=entry.link: self.open_article(url))
            article_layout.add_widget(open_button)

            self.news_layout.add_widget(article_layout)

    def parse_podcast_feed(self, req, result):
        feed = feedparser.parse(result)
        if feed.bozo:
            self.show_error_popup("Failed to parse Podcast RSS feed. Please check the URL.")
            return
        
        self.podcast_layout.clear_widgets()  # Clear previous podcast episodes

        for entry in feed.entries:
            episode_layout = BoxLayout(orientation='horizontal', size_hint_y=None, height=40)

            episode_title = Label(text=entry.title, text_size=(Window.width - 150, None), halign='left', valign='middle')
            episode_layout.add_widget(episode_title)

            open_button = Button(text='Listen', size_hint=(None, None), size=(100, 40))
            open_button.bind(on_release=lambda btn, url=entry.link: self.open_article(url))
            episode_layout.add_widget(open_button)

            self.podcast_layout.add_widget(episode_layout)

    def open_article(self, url):
        if platform in ('android', 'ios'):
            webbrowser.open(url)  # Use webbrowser for mobile platforms
        else:
            webbrowser.open_new_tab(url)  # Use a new tab for desktop platforms

    def on_request_error(self, req, error):
        # Show error popup for request issues
        self.show_error_popup(f"Network error: {error}. Please check your internet connection or URL.")

    def show_error_popup(self, message):
        popup_layout = BoxLayout(orientation='vertical', padding=10)
        popup_label = Label(text=message)
        popup_layout.add_widget(popup_label)
        close_button = Button(text='Close', size_hint=(1, None), height=40)
        close_button.bind(on_release=lambda btn: popup.dismiss())
        popup_layout.add_widget(close_button)
        popup = Popup(title='Error', content=popup_layout, size_hint=(0.8, 0.3))
        popup.open()

if __name__ == '__main__':
    NewsApp().run()
