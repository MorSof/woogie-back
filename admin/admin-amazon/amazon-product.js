function generateAmazonMockup() {
  return {
    "SearchResult": {
      "Items": [
        {
          "ASIN": "0545162076",
          "DetailPageURL": "https://www.amazon.com/dp/0545162076?tag=dgfd&linkCode=osi",

          "ItemInfo": {
            "Title": {
              "DisplayValue": "Harry Potter Paperback Box Set (Books 1-7)",
              "Label": "Title",
              "Locale": "en_US"
            },
            "ProductInfo": {
              "Color": {
                "DisplayValue": "brown trunk",
                "Label": "Color",
                "Locale": "en_US"
              },
              "IsAdultProduct": {
                "DisplayValue": false,
                "Label": "IsAdultProduct",
                "Locale": "en_US"
              }
            }
          },
          "DeliveryInfo": {
            "IsAmazonFulfilled": false,
            "IsFreeShippingEligible": false,
            "IsPrimeEligible": false
          },

          "Images": {
            "Primary": {
              "Small": {
                "URL": "https://m.media-amazon.com/images/I/41FYkVPzrIL._SL75_.jpg",
                "Height": 75,
                "Width": 75
              },
              "Medium": {
                "URL": "https://m.media-amazon.com/images/I/41FYkVPzrIL._SL160_.jpg",
                "Height": 160,
                "Width": 160
              },
              "Large": {
                "URL": "https://m.media-amazon.com/images/I/41FYkVPzrIL.jpg",
                "Height": 500,
                "Width": 500
              }
            },
            "Variants": [{
              "Small": {
                "URL": "https://m.media-amazon.com/images/I/51CjYz4iQHL._SL75_.jpg",
                "Height": 75,
                "Width": 75
              },
              "Medium": {
                "URL": "https://m.media-amazon.com/images/I/51CjYz4iQHL._SL160_.jpg",
                "Height": 160,
                "Width": 160
              },
              "Large": {
                "URL": "https://m.media-amazon.com/images/I/51CjYz4iQHL.jpg",
                "Height": 500,
                "Width": 500
              }
            }]
          },
          "Offers": {
            "Listings": [
              {
                "Condition": {
                  "DisplayValue": "nuevo",
                  "Label": "Condición",
                  "Locale": "es_US",
                  "Value": "New"
                },
                "Id": "l2dKMJRrPVX3O7DAPQ6DWLXBjBeRYsruAnKVf1LNXyjFTUw%2FnNBn41CJV2489iPYMSGuynW8uuwMQ7GhGrcT9F%2F%2FgO5bdp%2B2l0HbPvvHy05ASCdqrOaxWA%3D%3D",
                "Price": {
                  "Amount": 50.2,
                  "Currency": "USD",
                  "DisplayAmount": "$52.16",
                  "Savings": {
                    "Amount": 34.77,
                    "Currency": "USD",
                    "DisplayAmount": "$34.77 (40%)",
                    "Percentage": 40
                  }
                }
              }
            ]
          }
        }
      ],
      "SearchURL": "https://www.amazon.com/s/?field-keywords=Harry+Potter&search-alias=aps&tag=dgfd&linkCode=osi",
      "TotalResultCount": 146
    }
  }
}

module.exports = generateAmazonMockup;
