import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Table = () => {
  const [users, setUsers] = useState([]);
//   İlkin olaraq null olaraq təyin edilir cunki ilk dəfə yükləndikdə heç bir istifadəçi seçilmir id yox və heç bir update aparılmır
  const [currentRow, setCurrentRow] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    age: ""
  });


// Başlanğıcda boş array kimi müəyyən edilir çünki ilk dəfə yüklənən zaman heç bir filtrləmə aparılmır
  const [filteredUsers, setFilteredUsers] = useState([]);
//  update ve add açıq olub olmadığını göstərən statedir true oalnda modal ekranda görünür əks halda gorunmur
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:4040/users")
      .then((res) => {
        setUsers(res.data);
        setFilteredUsers(res.data);
      })
      .catch((error) => console.error(error));
  }, []);

  const handleSearch = (e) => {
    // Bu axtarışın boyuk kicik hərflərə qarsı olmasının qarşısını alır
    const value = e.target.value.toLowerCase();
    if (value === "") {
        // Bu bütün userlerin yenidən göstərilməsini edir
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        `${user.name} ${user.surname} ${user.age}`
          .toLowerCase()
          .includes(value)
      );
      setFilteredUsers(filtered);
    }
  };

//   yeni istifadəçi əlavə etmək üçün forum açır
  const handleAddRow = () => {
    setFormData({ name: "", surname: "", age: "" });
    setCurrentRow(null);
    setShowModal(true);   // forumun ekranda görünməsini edir
  };

  const handleSubmit = () => {
    // currentRow doludursa bu mövcud userlerin edid olunduğunu bildirir və movcud userleri update edir
    if (currentRow) {
      axios
        .put(`http://localhost:4040/users/${currentRow.id}`, formData)
        .then((response) => {
          setUsers(
            // user.id guncellenmis currentRow.idə bərabərdirsə onu respond.data ilə deyisdirir
            users.map((user) =>
              user.id === currentRow.id ? response.data : user
            )
          );

        //   filteride guncelle
          setFilteredUsers(
            users.map((user) =>
              user.id === currentRow.id ? response.data : user
            )
          );
        setCurrentRow(null);  // yəni hecbir setir edid olmur         
        });

        // currentRow boşdursa bu yeni user elave edir
    } else {
      const newUser = { ...formData, id: uuidv4() };
      axios
        .post("http://localhost:4040/users", newUser)
        .then((response) => {
          setUsers([...users, response.data]);
        //     //   filteride guncelle
          setFilteredUsers([...users, response.data]);
        });
    }
    setShowModal(false); // yəni hecbir setir edid olmur    
  };

  const handleEdit = (user) => {
    setCurrentRow(user);
    setFormData(user);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    // id düzgün user tapmaq və silmək üçün
    axios.delete(`http://localhost:4040/users/${id}`).then(() => {
      const updatedUsers = users.filter((user) => user.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="axtar..."
        onChange={handleSearch}
        style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
      />
      <button onClick={handleAddRow} className="btn">Add Row</button>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Age</th>
            <th>Edit</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.surname}</td>
              <td>{user.age}</td>
              <td>
                <FaEdit onClick={() => handleEdit(user)} style={{ cursor: 'pointer', color: 'blue' }} />
              </td>
              <td>
                <FaTrashAlt onClick={() => handleDelete(user.id)} style={{ cursor: 'pointer', color: 'red' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

{/*  Bu modalın acılb bağlanmasnı idare edir.*/}
      {showModal && ( 
        <div id="add-row-modal" className="modal" style={modalStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <span className="close" onClick={handleCloseModal} style={closeStyle}>&times;</span>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="text"
              placeholder="Surname"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              style={{ width: "100%", padding: "8px", margin: "8px 0" }}
            />
            <button onClick={handleSubmit} className="btn">
              {currentRow ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  display: 'block',
  position: 'fixed',
  zIndex: 1,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgba(0,0,0,0.4)',
};

const modalContentStyle = {
  backgroundColor: '#fefefe',
  margin: '15% auto',
  padding: '20px',
  border: '1px solid #888',
  width: '80%',
  maxWidth: '400px',
  borderRadius: '8px',
};

const closeStyle = {
  color: '#aaa',
  float: 'right',
  fontSize: '28px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export default Table;
