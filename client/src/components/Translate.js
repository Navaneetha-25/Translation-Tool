//./components/Translate.js with the correct api req  
import React,{useEffect,useState} from "react";
import { useNavigate } from "react-router-dom";
import countries from "./data.js";
const Translate=()=>{
    const [targetLang,setTargetLang]=useState("hi-IN");
    const [sourceLang,setSourceLang]=useState("en-GB");
    const [history,setHistory]=useState([]);
    const [sidebarOpen,setSidebarOpen]=useState(false);
    const [fromText,setFromText]=useState("");
    const [toText,setToText]=useState("");
    const [fromLang,setFromLang]=useState("en-GB");
    const [toLang,setToLang]=useState("hi-IN");
    const [loading,setLoading]=useState(false);
    const [countriesData,setCountriesData]=useState({});
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "enabled";
    });
    const [file,setFile]=useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(darkMode){
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode","enabled");
    }else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode","disabled");
    }
}, [darkMode]);

 useEffect(()=>{
    const fetchLanguages=async()=>{
    try{
        const response=await fetch("http://localhost:5000/languages");
        if(!response.ok) throw new Error("Failed to fetch languages");
        const data=await response.json();
        setCountriesData(data);
    }catch(error){
        console.log("Error fetching languages:",error);
    }
};
fetchLanguages();
},[]);

const handleLogout = () => {
    navigate("/login"); 
};
    const handleTranslate=async()=>{
        if(!fromText.trim()) return ;
        setLoading(true);
        setToText("Translating...");
        try{
            const response = await fetch("http://localhost:5000/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: fromText,
                    source: fromLang.split("-")[0],
                    target: toLang.split("-")[0],
                }),
            });
            if(!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            setToText(data.translatedText);
            setHistory(prevHistory => [...prevHistory, { from: fromText, to: data.translatedText }]);
           }catch(error){
            console.error("Fetch error:",error);
            setToText("Error in translation");
        }finally{
            setLoading(false);
        }
    };
    const handleFileUpload=async(event)=>{
        const uploadedFile=event.target.files[0];
        if(!uploadedFile) return ;
        if(uploadedFile.size>100*1024*1024){
            alert("File size exceeds 100MB limit");
            return ;
        }
            setFile(uploadedFile);
            const formData=new FormData();
            formData.append("file",uploadedFile);
            formData.append("language",fromLang.split("-")[0]);
            formData.append("targetLang", toLang.split("-")[0]);
            formData.append("sourceLang", fromLang.split("-")[0]);
            console.log("FormData:",formData.get("file"), formData.get("language"), formData.get("targetLang"), formData.get("sourceLang")); // Check FormData
            try{
                setLoading(true);
                setFromText("Extracting text...");
                setToText("Translating...");
                const response=await fetch("http://localhost:5000/extract-text",{
                    method:"POST",
                    body:formData,
                });
                if(!response.ok) {
                    const errorData=await response.json();
                    throw new Error(errorData.error||"Error extracting or translating text");
                }
                const data=await response.json();
                setFromText(data.extractedText);
                setToText(data.translatedText);
                setHistory((prevHistory)=>[...prevHistory,{from:data.extractedText,to:data.translatedText}]);
            }catch(error){
                console.error("File upload error:",error);
                setFromText("Error extracting text");
                setToText("Error in translation");
            }finally{
                setLoading(false);
            }
    };
    const handleFileCancel = () => {
        setFile(null);
        document.getElementById("file-input").value = "";
        setFromText("");
        setToText("");
    };

    const handleExchange=()=>{
        setFromText(toText);
        setToText(fromText);
        setFromLang(toLang);
        setToLang(fromLang);
    };
    return(
        <>
         <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
        <button className="sidebar-toggle" onClick={()=>setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "Close History" :"Open History"}    
        </button>
        <div className={`sidebar-container ${sidebarOpen ? "open" : ""}`}>
           <br/> <br/>
           <h2>Translation History</h2>
           <div className="history">
            {history.length===0?(
                <p style={{textAlign:"center",color:"#bbb"}}>No history yet</p>
            ):(
                history.map((entry,index)=>(
                    <div key={index} className="history-item">
                        <span>{entry.from}→{entry.to}</span>
                    </div>
                ))
            )}
           </div>
           <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className={`container ${sidebarOpen ? "shift" :""}`}>
          <div className="above-container">
           <h1 className="above-container-content">Translator</h1>  
          </div>    
        <div className="wrapper">
            <div className="text-input">
                <textarea className="from-text" placeholder="Enter text" value={fromText} onChange={(e)=>setFromText(e.target.value)}></textarea>
                <textarea className="to-text" readOnly placeholder={loading ? "Translating..":"Translation"} value={toText}></textarea>
            </div>
            <ul className="controls">
                <li className="row from">
                    <div className="icons">
                        <i id="from" className="fas fa-volume-up"></i>
                        <i id="from" className="fas fa-copy"></i>
                    </div>
                    <select value={fromLang} onChange={(e)=> setFromLang(e.target.value)}>
                        {Object.entries(countries).map(([code,name])=>(
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </li>
                <li className="exchange" onClick={handleExchange}>
                    <i className="fas fa-exchange-alt"></i>
                </li>
                <li className="row to">
                    <select value={toLang} onChange={(e)=>setToLang(e.target.value)}>
                        {Object.entries(countries).map(([code,name])=>(
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <div className="icons">
                        <i id="to" className="fas fa-volume-up"></i>
                        <i id="to" className="fas fa-copy"></i>
                    </div>
                </li>
            </ul>
        </div> 
        <div className="file-upload">
                <label className="custom-file-label" htmlFor="file-input">Choose File</label>
                <input type="file" name="file" id="file-input" accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                {file && <span>{file.name}</span>}
                {file && <button className={`cancel-upload ${file ? "show" : ""}`} onClick={handleFileCancel}>
    Cancel Upload
</button> }
        </div>
        <button onClick={handleTranslate}>Translate Text</button>
        </div></>
    );
};
export default Translate; 