import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//import { setNotifications } from "../store/parcelSlice";
import { getPackageInfo } from "../store/parcelSlice";
import { setNotification } from "../screens/SettingsScreen";

// export function koko() {
//   console.log('kokokooooooooooooooooooooooo');
// }

const test = () => {
  //const [data, setData] = useState(null);
  const dispatch = useDispatch();
  
  let counter = 0;
  let items = [];

  useEffect(() => {
    console.log('test/useEffect........');
    items = useSelector((state) => state.parcel.items);
    setNotifications();
  }, []);

  const initItems = () => {

  }

  const setNotifications = () => {
    console.log('test/setNotifications items........', items);

    const requestParams = {
      location: 'USA',
      language: 'EN'
    }

    items.map((item) => {
      counter++;
      if (item.status && item.status !== "delivered") {
        if (item.title === "Amazon") {
          data.title = "New update for parcel " + item.title + ' ' + item.trackingNumber;
          data.status = item.status;
          requestParams.trackingId = item.trackingNumber;
          //setNotification(data, 1);
          dispatch(getPackageInfo(requestParams));
        }
      }
    });
  }
};

export default test;
