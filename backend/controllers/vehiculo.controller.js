exports.getVehiculos = async (req, res) => {
    const vehiculos = [
      { id: 1, modelo: 'Toyota Hilux', patente: 'AA-1234', estado: 'Disponible' },
      { id: 2, modelo: 'Chevrolet N300', patente: 'BB-5678', estado: 'En uso' }
    ];
    res.json(vehiculos);
  };