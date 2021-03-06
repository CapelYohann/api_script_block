module.exports = function (sequelize, DataTypes) {
	const Script = sequelize.define('Script', {
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			autoIncrement: true
		},
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
		description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
		category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "clean"
    },
		size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
		downloads_count: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
		date_crea: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
		id_user: {
      type: DataTypes.BIGINT,
      allowNull: false,
      foreignKey: true
    },
    available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
	}, {
		paranoid: false,
		underscored: true,
		freezeTableName: true,
		timestamps: false
	});
	Script.associate = _associate;
	return Script;
}

// INTERNAL
function _associate(models) {
	models.Script.belongsTo(models.User, { foreignKey: 'id_user', targetKey: 'id' });
}