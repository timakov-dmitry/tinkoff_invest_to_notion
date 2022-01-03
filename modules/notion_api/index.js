const { Client, APIErrorCode } = require("@notionhq/client")

// Initializing a client


class NOTION_API {
    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_TOKEN,
        })
    }

    async get_database(databaseId) {
        const table = await this.notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "Landmark",
                text: {
                    contains: "Bridge",
                },
            },
        })
    }

    async add_item_to_database(databaseId) {
        try {
            const response = await this.notion.databases.create ({
                database_id: databaseId,
                filter: {
                    property: "Landmark",
                    text: {
                        contains: "Bridge",
                    },
                },
            })
        } catch (error) {
            if (error.code === APIErrorCode.ObjectNotFound) {
                //
                // For example: handle by asking the user to select a different database
                //
            } else {
                // Other error handling code
                console.error(error)
            }
        }
    }

}

export default NOTION_API