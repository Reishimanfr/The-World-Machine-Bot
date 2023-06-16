import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
    define: {
        timestamps: false
    }
})

export const nitroEmojis = sequelize.define('nitroEmojis', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emojiName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emojiLink: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

export const starboardConfig = sequelize.define('starboardConfig', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    boardId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
})

export const starboardEmojis = sequelize.define('starboardEmojis', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emoji: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export const reactionRoles = sequelize.define('reactionRoles', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buttonType: {
        type: DataTypes.NUMBER,
        allowNull: false
    }
})

export const anonymousMessages = sequelize.define('anonymousMessages', {
    messageId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    messageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
})

export default sequelize