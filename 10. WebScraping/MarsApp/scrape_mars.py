from splinter import Browser
from bs4 import BeautifulSoup as bs
from time import sleep
import pandas as pd
import requests
import pymongo
from pprint import pprint

def scrape_data():
        
    #setting up path to chrome driver for splinter
    executable_path={'executable_path':'chromedriver.exe'}

    #define function to remove ending substring from string
    def remove_substring(string, substring):
        if substring in string:
            return string[:-len(substring)]
        return string

    # #url with latest NASA stories
    # browser = Browser('chrome', **executable_path, headless=False)
    # url_1 = 'https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest'
    # browser.visit(url_1)
    # print('sleeping for 5')
    # sleep(5)

    # #set up parser
    # html = browser.html
    # soup = bs(html, 'lxml')

    # #get latest news articles
    # date_latest=soup.find('div', class_='list_date').text
    # title_latest=soup.find('div', class_='content_title').text
    # summary_latest=soup.find('div', class_='article_teaser_body').text

    # #close browser
    # browser.quit()

    # News_dict={"Date":date_latest,
    #         "Title": title_latest,
    #         "Summary": summary_latest}

    #getting featured image (without splinter)
    url_2 = 'https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars'
    response=requests.get(url_2)

    #set up parser
    soup = bs(response.content, 'lxml')

    featured_image=soup.find("div", class_="carousel_items")
    featured_image_title=featured_image.article['alt']
    #have to remove url string in brackets from html code
    featured_image_url='https://www.jpl.nasa.gov'+(featured_image.article['style'])[(featured_image.article['style']).find("(")+2:(featured_image.article['style']).find(")")-1]

    Featured_Img_Dict={"Title": featured_image_title,
                    "Source": featured_image_url}

    #visitng MarsWeather Twitter page
    url_3='https://twitter.com/marswxreport?lang=en'
    response=requests.get(url_3)

    #set up parser
    soup=bs(response.text, 'lxml')

    #finding latest tweet for Mars weather
    mars_weather=soup.find('div', class_='js-tweet-text-container')

    #dividing into p and a tags (sometimes a tag does not exist) and removing a tag from ptag with remove substring function
    try:
        mars_weather_p=mars_weather.p.text
        mars_weather_a=mars_weather.a.text
        mars_weather_today=remove_substring(mars_weather_p, mars_weather_a)
    except:
        mars_weather_today=mars_weather_p

    Mars_weather_dict={"Mars Weather": mars_weather_today}

    #mars facts
    url_4='https://space-facts.com/mars/'
    facts=pd.read_html(url_4)
    mars_facts=facts[0]
    mars_facts.columns=['Mars Planet Profile', 'Fact Value']

    mars_facts_dict=mars_facts.set_index('Mars Planet Profile').to_dict()['Fact Value']

    #faces of mars images
    #alternate website used because of government shutdown
    url_5='http://www.planetary.org/blogs/guest-blogs/bill-dunford/20140203-the-faces-of-mars.html'
    response=requests.get(url_5)

    #setup parser
    soup=bs(response.text, 'lxml')

    #parse to get images
    hemispheres=soup.find_all('img', class_='img840')
    hemisphere_pic_dict={}

    #loop through images and get picture link and title of pic and put in dictionary (remove extra space at end of str if exists)
    for hemisphere in hemispheres:
        title=hemisphere['alt']
        image_src=hemisphere['src']
        if title[-1]==' ':
            title=title[:-len(title[-1])]
        if title[0:6]=='Mars: ':
            title=title[6:]
        
        hemisphere_pic_dict[title]= image_src

    mars_data=[Mars_weather_dict, Featured_Img_Dict, hemisphere_pic_dict, mars_facts_dict]

    return mars_data